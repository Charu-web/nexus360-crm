// src/controllers/loans.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';
import { AutomationEngine } from '../services/automation.service';

const prisma = new PrismaClient();

/**
 * Utility: Standard EMI Calculation
 * Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number) {
  if (!principal || !annualRate || !tenureMonths) return 0;
  const monthlyRate = annualRate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

/**
 * POST /api/v1/loans/calculate-emi
 * Public & authenticated EMI Amortization calculator.
 */
export async function calculateLoanEMI(req: TenantRequest, res: Response) {
  try {
    const { amount, interestRate = 10.5, tenureMonths = 36 } = req.body;
    const P = Number(amount);
    const R = Number(interestRate);
    const N = Number(tenureMonths);

    if (!P || P <= 0) {
      return res.status(400).json({ success: false, message: 'Valid loan amount required' });
    }

    const emi = calculateEMI(P, R, N);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    return res.json({
      success: true,
      data: {
        principal: P,
        interestRate: R,
        tenureMonths: N,
        monthlyEmi: emi,
        totalInterest,
        totalPayment
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/loans
 * Lists loan applications with filtering by type, bank, and status.
 */
export async function getLoanApplications(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { status, loanType, bankPartner, search } = req.query;

    const where: any = { tenantId };

    if (status) where.status = String(status);
    if (loanType) where.loanType = String(loanType);
    if (bankPartner) where.bankPartner = String(bankPartner);

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { applicantName: { contains: q } },
        { phone: { contains: q } },
        { applicationId: { contains: q } },
        { dsaCode: { contains: q } }
      ];
    }

    const loans = await prisma.loanApplication.findMany({
      where,
      orderBy: { createdDate: 'desc' },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true } },
        documents: true,
        lead: { select: { id: true, leadId: true, customerName: true } }
      }
    });

    const summary = {
      totalApplications: loans.length,
      totalRequested: loans.reduce((s, l) => s + (l.requestedAmount || 0), 0),
      totalSanctioned: loans.reduce((s, l) => s + (l.sanctionedAmount || 0), 0),
      totalDisbursed: loans.reduce((s, l) => s + (l.disbursedAmount || 0), 0),
      disbursedCount: loans.filter(l => l.status === 'Disbursed').length,
      sanctionedCount: loans.filter(l => l.status === 'Sanctioned').length,
      inReviewCount: loans.filter(l => l.status === 'In Review' || l.status === 'Submitted').length
    };

    return res.json({ success: true, summary, loans });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/loans
 * Creates a new loan application and associates with unified lead if applicable.
 */
export async function createLoanApplication(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      applicantName,
      phone,
      email,
      panNumber,
      aadhaarNumber,
      employmentType = 'Salaried',
      monthlyIncome = 0,
      loanType = 'Personal Loan',
      requestedAmount,
      bankPartner = 'HDFC Bank',
      dsaCode = 'DST-DIRECT-001',
      tenureMonths = 36,
      interestRate = 10.5,
      leadId,
      assignedToId
    } = req.body;

    if (!applicantName || !phone || !requestedAmount) {
      return res.status(400).json({ success: false, message: 'Applicant name, phone, and requested amount are required.' });
    }

    const P = Number(requestedAmount);
    const R = Number(interestRate);
    const N = Number(tenureMonths);
    const emi = calculateEMI(P, R, N);

    const count = await prisma.loanApplication.count({ where: { tenantId } });
    const applicationId = `LOAN-${1000 + count + 1}`;

    const loan = await prisma.loanApplication.create({
      data: {
        tenantId,
        applicationId,
        applicantName,
        phone,
        email,
        panNumber,
        aadhaarNumber,
        employmentType,
        monthlyIncome: Number(monthlyIncome),
        loanType,
        requestedAmount: P,
        sanctionedAmount: 0,
        disbursedAmount: 0,
        bankPartner,
        dsaCode,
        status: 'Submitted',
        tenureMonths: N,
        interestRate: R,
        emiAmount: emi,
        leadId: leadId || null,
        assignedToId: assignedToId || null
      }
    });

    // Auto-create Activity
    await prisma.activity.create({
      data: {
        tenantId,
        title: `Loan Application Created: ${applicationId}`,
        details: `${loanType} for ₹${P.toLocaleString()} with ${bankPartner}`,
        type: 'LOAN',
        entityType: 'LoanApplication',
        entityId: loan.id
      }
    });

    // Trigger Automations
    await AutomationEngine.processEvent(tenantId, 'loan.submitted', {
      id: loan.id,
      applicationId: loan.applicationId,
      applicantName: loan.applicantName,
      phone: loan.phone,
      loanType: loan.loanType,
      requestedAmount: loan.requestedAmount,
      bankPartner: loan.bankPartner,
      assignedToId: loan.assignedToId
    });

    return res.status(201).json({ success: true, loan });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/v1/loans/:id
 * Updates loan application status (Sanction, Disburse, Reject).
 */
export async function updateLoanApplication(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const {
      status,
      sanctionedAmount,
      disbursedAmount,
      rejectionReason,
      assignedToId,
      bankPartner
    } = req.body;

    const existing = await prisma.loanApplication.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Loan application not found' });
    }

    const updated = await prisma.loanApplication.update({
      where: { id },
      data: {
        status: status || existing.status,
        sanctionedAmount: sanctionedAmount !== undefined ? Number(sanctionedAmount) : existing.sanctionedAmount,
        disbursedAmount: disbursedAmount !== undefined ? Number(disbursedAmount) : existing.disbursedAmount,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : existing.rejectionReason,
        assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId,
        bankPartner: bankPartner || existing.bankPartner
      }
    });

    // Fire Automation on Status Change
    if (status && status !== existing.status) {
      const eventKey = status === 'Disbursed' ? 'loan.disbursed' : status === 'Sanctioned' ? 'loan.sanctioned' : 'loan.updated';
      await AutomationEngine.processEvent(tenantId, eventKey, {
        id: updated.id,
        applicationId: updated.applicationId,
        status: updated.status,
        disbursedAmount: updated.disbursedAmount,
        sanctionedAmount: updated.sanctionedAmount,
        applicantName: updated.applicantName,
        phone: updated.phone
      });

      await prisma.activity.create({
        data: {
          tenantId,
          title: `Loan Status Updated to ${status}`,
          details: `Application ${updated.applicationId} updated. Disbursed: ₹${updated.disbursedAmount.toLocaleString()}`,
          type: 'LOAN',
          entityType: 'LoanApplication',
          entityId: updated.id
        }
      });
    }

    return res.json({ success: true, loan: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/loans/:id/documents
 * Attaches a KYC document to the loan application.
 */
export async function attachLoanDocument(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const { documentType, documentUrl, notes } = req.body;

    if (!documentType || !documentUrl) {
      return res.status(400).json({ success: false, message: 'Document type and URL required' });
    }

    const doc = await prisma.loanDocument.create({
      data: {
        tenantId,
        loanApplicationId: id,
        documentType,
        documentUrl,
        notes: notes || null,
        status: 'Pending'
      }
    });

    return res.status(201).json({ success: true, document: doc });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
