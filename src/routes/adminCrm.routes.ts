import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getDeals,
  createDeal,
  updateDealStage,
  deleteDeal,
  getMeetings,
  createMeeting,
  deleteMeeting,
  getProducts,
  createProduct,
  deleteProduct,
  getQuotes,
  createQuote,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getNotes,
  createNote,
  deleteNote,
  getActivities,
} from '../controllers/adminCrm.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt, requireAdmin);

// Leads
router.get('/leads', requirePermission('leads'), getLeads);
router.post('/leads', requirePermission('leads'), createLead);
router.get('/leads/:id', requirePermission('leads'), getLeadById);
router.put('/leads/:id', requirePermission('leads'), updateLead);
router.delete('/leads/:id', requirePermission('leads'), deleteLead);
router.post('/leads/:id/convert', requirePermission('leads'), convertLead);

// Customers
router.get('/customers', requirePermission('customers'), getCustomers);
router.post('/customers', requirePermission('customers'), createCustomer);
router.put('/customers/:id', requirePermission('customers'), updateCustomer);
router.delete('/customers/:id', requirePermission('customers'), deleteCustomer);

// Contacts
router.get('/contacts', getContacts);
router.post('/contacts', createContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

// Deals
router.get('/deals', getDeals);
router.post('/deals', createDeal);
router.patch('/deals/:id/stage', updateDealStage);
router.delete('/deals/:id', deleteDeal);

// Meetings
router.get('/meetings', getMeetings);
router.post('/meetings', createMeeting);
router.delete('/meetings/:id', deleteMeeting);

// Products
router.get('/products', getProducts);
router.post('/products', createProduct);
router.delete('/products/:id', deleteProduct);

// Quotes
router.get('/quotes', getQuotes);
router.post('/quotes', createQuote);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Notes
router.get('/notes', getNotes);
router.post('/notes', createNote);
router.delete('/notes/:id', deleteNote);

// Activities
router.get('/activities', requirePermission('activities'), getActivities);

export default router;
