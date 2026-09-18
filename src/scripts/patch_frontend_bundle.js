const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let content = fs.readFileSync(bundlePath, 'utf8');

console.log('Original Bundle size:', content.length, 'bytes');

const componentsJs = `
const CRMBuilderComponent = () => {
  const [activeTab, setActiveTab] = rt.useState('overview');
  const [showWizard, setShowWizard] = rt.useState(false);
  const [wizardStep, setWizardStep] = rt.useState(1);
  const [loading, setLoading] = rt.useState(false);
  const [notification, setNotification] = rt.useState(null);

  const [tenantInfo, setTenantInfo] = rt.useState({ name: 'Empire CRM Workspace', template: 'Generic CRM', plan: 'PRO' });
  const [modulesList, setModulesList] = rt.useState([]);
  const [customFieldsList, setCustomFieldsList] = rt.useState([]);
  const [pipelinesList, setPipelinesList] = rt.useState([]);
  const [formsList, setFormsList] = rt.useState([]);
  const [usersList, setUsersList] = rt.useState([]);

  const [wizardForm, setWizardForm] = rt.useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    phone: '+1 555-0199',
    industry: 'Technology',
    template: 'GENERIC',
    plan: 'PRO'
  });

  const [customModuleForm, setCustomModuleForm] = rt.useState({
    moduleKey: '',
    name: '',
    singularName: '',
    pluralName: '',
    icon: 'Folder',
    description: ''
  });

  const [customFieldForm, setCustomFieldForm] = rt.useState({
    entityType: 'LEAD',
    fieldName: '',
    fieldType: 'TEXT',
    isRequired: false,
    optionsStr: ''
  });

  const [pipelineForm, setPipelineForm] = rt.useState({
    name: '',
    stagesStr: 'New Lead, Contacted, Qualified, Proposal Sent, Won, Lost'
  });

  const [userInviteForm, setUserInviteForm] = rt.useState({
    fullName: '',
    email: '',
    password: 'Password123!',
    roleName: 'SALES'
  });

  const [brandingForm, setBrandingForm] = rt.useState({
    companyName: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    logoUrl: ''
  });

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
  };

  const showMsg = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAllData = () => {
    setLoading(true);
    const headers = getHeaders();

    fetch('/api/v1/modules', { headers })
      .then(r => r.json())
      .then(d => { if (d.modules) setModulesList(d.modules); })
      .catch(() => {});

    fetch('/api/v1/custom-fields', { headers })
      .then(r => r.json())
      .then(d => { if (d.customFields) setCustomFieldsList(d.customFields); })
      .catch(() => {});

    fetch('/api/v1/pipelines', { headers })
      .then(r => r.json())
      .then(d => { if (d.pipelines) setPipelinesList(d.pipelines); })
      .catch(() => {});

    fetch('/api/v1/forms', { headers })
      .then(r => r.json())
      .then(d => { if (d.forms) setFormsList(d.forms); })
      .catch(() => {});

    fetch('/api/v1/tenant/users', { headers })
      .then(r => r.json())
      .then(d => { if (d.users) setUsersList(d.users); })
      .catch(() => {});

    fetch('/api/v1/tenant/settings', { headers })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const nameSetting = d.settings.find(s => s.key === 'company_name');
          if (nameSetting) setTenantInfo(prev => ({ ...prev, name: nameSetting.value }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  rt.useEffect(() => {
    fetchAllData();
  }, []);

  const handleProvisionWorkspace = (e) => {
    e.preventDefault();
    if (!wizardForm.companyName || !wizardForm.email || !wizardForm.password) {
      showMsg('Please fill in Company Name, Email, and Password');
      return;
    }
    setLoading(true);
    fetch('/api/v1/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: wizardForm.fullName || 'Workspace Owner',
        email: wizardForm.email,
        phone: wizardForm.phone,
        password: wizardForm.password,
        companyName: wizardForm.companyName,
        template: wizardForm.template,
        plan: wizardForm.plan
      })
    })
    .then(r => r.json())
    .then(d => {
      if (d.success && d.accessToken) {
        localStorage.setItem('accessToken', d.accessToken);
        showMsg('CRM Workspace "' + wizardForm.companyName + '" created successfully!');
        setShowWizard(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showMsg('Error creating CRM: ' + (d.message || 'Unknown error'));
      }
    })
    .catch(err => showMsg('Failed to provision workspace'))
    .finally(() => setLoading(false));
  };

  const handleCreateCustomModule = (e) => {
    e.preventDefault();
    if (!customModuleForm.name || !customModuleForm.moduleKey) {
      showMsg('Module Key and Name are required');
      return;
    }
    setLoading(true);
    fetch('/api/v1/modules/custom', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(customModuleForm)
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        showMsg('Custom CRM Module "' + customModuleForm.name + '" created!');
        setCustomModuleForm({ moduleKey: '', name: '', singularName: '', pluralName: '', icon: 'Folder', description: '' });
        fetchAllData();
      } else {
        showMsg('Error: ' + (d.message || 'Could not create module'));
      }
    })
    .catch(() => showMsg('Failed to create custom module'))
    .finally(() => setLoading(false));
  };

  const handleCreateCustomField = (e) => {
    e.preventDefault();
    if (!customFieldForm.fieldName) {
      showMsg('Field Name is required');
      return;
    }
    const options = customFieldForm.optionsStr ? customFieldForm.optionsStr.split(',').map(s => s.trim()) : undefined;
    setLoading(true);
    fetch('/api/v1/custom-fields', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        entityType: customFieldForm.entityType,
        fieldName: customFieldForm.fieldName,
        fieldType: customFieldForm.fieldType,
        isRequired: customFieldForm.isRequired,
        options
      })
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        showMsg('Custom Field "' + customFieldForm.fieldName + '" added!');
        setCustomFieldForm({ entityType: customFieldForm.entityType, fieldName: '', fieldType: 'TEXT', isRequired: false, optionsStr: '' });
        fetchAllData();
      } else {
        showMsg('Error: ' + (d.message || 'Could not create custom field'));
      }
    })
    .catch(() => showMsg('Failed to create field'))
    .finally(() => setLoading(false));
  };

  const handleCreatePipeline = (e) => {
    e.preventDefault();
    if (!pipelineForm.name) {
      showMsg('Pipeline Name is required');
      return;
    }
    setLoading(true);
    fetch('/api/v1/pipelines', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: pipelineForm.name })
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        showMsg('Custom Pipeline "' + pipelineForm.name + '" created!');
        setPipelineForm({ name: '', stagesStr: '' });
        fetchAllData();
      } else {
        showMsg('Error: ' + (d.message || 'Could not create pipeline'));
      }
    })
    .catch(() => showMsg('Failed to create pipeline'))
    .finally(() => setLoading(false));
  };

  const handleInviteUser = (e) => {
    e.preventDefault();
    if (!userInviteForm.email || !userInviteForm.fullName) {
      showMsg('Name and Email are required');
      return;
    }
    setLoading(true);
    fetch('/api/v1/tenant/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userInviteForm)
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        showMsg('User "' + userInviteForm.fullName + '" invited to workspace!');
        setUserInviteForm({ fullName: '', email: '', password: 'Password123!', roleName: 'SALES' });
        fetchAllData();
      } else {
        showMsg('Error: ' + (d.message || 'Could not invite user'));
      }
    })
    .catch(() => showMsg('Failed to invite user'))
    .finally(() => setLoading(false));
  };

  const handleSaveBranding = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch('/api/v1/tenant/branding', {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(brandingForm)
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        showMsg('CRM Workspace branding updated!');
        if (brandingForm.companyName) setTenantInfo(prev => ({ ...prev, name: brandingForm.companyName }));
      } else {
        showMsg('Error updating branding');
      }
    })
    .catch(() => showMsg('Failed to save branding'))
    .finally(() => setLoading(false));
  };

  const templates = [
    { key: 'GENERIC', name: 'Generic Sales CRM', desc: 'Universal CRM setup suitable for all business types and general sales operations.' },
    { key: 'REAL_ESTATE', name: 'Real Estate CRM', desc: 'Tailored for Property Developers, Agents, and Consultancies.' },
    { key: 'EDUCATION', name: 'Education & Admissions CRM', desc: 'Optimized for Schools, Colleges, and EdTech Platforms.' },
    { key: 'AGENCY', name: 'Marketing & Digital Agency CRM', desc: 'Ideal for Ad Agencies and Software Consultancies.' },
    { key: 'IT_SERVICES', name: 'IT Services & SaaS CRM', desc: 'Designed for MSPs, SaaS sales, and tech firms.' },
    { key: 'HEALTHCARE', name: 'Healthcare & Clinic CRM', desc: 'Tailored for Hospitals, Clinics, and Medical Suppliers.' },
    { key: 'FINANCE', name: 'Finance & Banking CRM', desc: 'Ideal for Loan DSA, Financial Advisors, and Wealth Managers.' },
    { key: 'RECRUITMENT', name: 'Recruitment & Staffing CRM', desc: 'Tailored for HR agencies, headhunters, and staffing firms.' },
    { key: 'MANUFACTURING', name: 'Manufacturing B2B CRM', desc: 'Tailored for industrial suppliers and B2B manufacturers.' },
    { key: 'ECOMMERCE', name: 'E-commerce Retail CRM', desc: 'Tailored for D2C brands and online sellers.' },
    { key: 'BLANK', name: 'Blank CRM Workspace', desc: 'Clean slate setup with only Dashboard + Builder.' }
  ];

  return d.jsxs('div', { className: 'p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans', children: [
    d.jsxs('div', { className: 'flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur', children: [
      d.jsxs('div', { className: 'space-y-1', children: [
        d.jsxs('div', { className: 'flex items-center space-x-3', children: [
          d.jsx('span', { className: 'px-3 py-1 bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-black tracking-widest uppercase rounded-full', children: 'SaaS Platform Builder' }),
          d.jsx('span', { className: 'px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-full', children: tenantInfo.plan + ' PLAN' })
        ]}),
        d.jsx('h1', { className: 'text-2xl font-black text-white tracking-tight', children: tenantInfo.name }),
        d.jsx('p', { className: 'text-xs text-slate-400 font-medium', children: 'Customize modules, fields, pipelines, views, forms, roles, and create new CRM workspaces.' })
      ]}),
      d.jsxs('div', { className: 'flex items-center space-x-3', children: [
        d.jsx('button', {
          onClick: () => { setWizardStep(1); setShowWizard(true); },
          className: 'px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition transform hover:scale-105 cursor-pointer flex items-center space-x-2',
          children: [d.jsx('span', { className: 'text-base font-bold', children: '+' }), d.jsx('span', { children: 'Create New CRM Workspace' })]
        })
      ]})
    ]}),

    notification && d.jsx('div', { className: 'p-4 bg-indigo-900/80 border border-indigo-500 text-indigo-200 text-xs font-bold rounded-xl animate-fade-in', children: notification }),

    d.jsx('div', { className: 'flex items-center space-x-1 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none', children: [
      { id: 'overview', label: 'CRM Overview' },
      { id: 'modules', label: 'Modules & Custom Modules' },
      { id: 'fields', label: 'Custom Field Builder' },
      { id: 'pipelines', label: 'Pipeline Builder' },
      { id: 'forms', label: 'Form Builder' },
      { id: 'roles', label: 'Roles & Team' },
      { id: 'branding', label: 'CRM Branding' }
    ].map(t => d.jsx('button', {
      key: t.id,
      onClick: () => setActiveTab(t.id),
      className: \`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap \${activeTab === t.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}\`,
      children: t.label
    })) }),

    activeTab === 'overview' && d.jsxs('div', { className: 'space-y-6 animate-fade-in', children: [
      d.jsxs('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', children: [
        d.jsxs('div', { className: 'p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1', children: [
          d.jsx('span', { className: 'text-xs font-bold text-slate-400 uppercase tracking-wider', children: 'Total Modules' }),
          d.jsx('div', { className: 'text-3xl font-black text-indigo-400', children: modulesList.length || 12 })
        ]}),
        d.jsxs('div', { className: 'p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1', children: [
          d.jsx('span', { className: 'text-xs font-bold text-slate-400 uppercase tracking-wider', children: 'Custom Modules' }),
          d.jsx('div', { className: 'text-3xl font-black text-purple-400', children: modulesList.filter(m => m.isCustom).length })
        ]}),
        d.jsxs('div', { className: 'p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1', children: [
          d.jsx('span', { className: 'text-xs font-bold text-slate-400 uppercase tracking-wider', children: 'Custom Fields' }),
          d.jsx('div', { className: 'text-3xl font-black text-cyan-400', children: customFieldsList.length })
        ]}),
        d.jsxs('div', { className: 'p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1', children: [
          d.jsx('span', { className: 'text-xs font-bold text-slate-400 uppercase tracking-wider', children: 'Team Members' }),
          d.jsx('div', { className: 'text-3xl font-black text-emerald-400', children: usersList.length || 1 })
        ]})
      ]}),
      d.jsxs('div', { className: 'p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: 'Workspace Multi-Tenant Architecture' }),
        d.jsx('p', { className: 'text-xs text-slate-400 leading-relaxed', children: 'Your Empire CRM workspace is isolated with Row Level Security (RLS). Every resource is tagged with your organization context.' })
      ]})
    ]}),

    activeTab === 'modules' && d.jsxs('div', { className: 'space-y-6 animate-fade-in', children: [
      d.jsxs('form', { onSubmit: handleCreateCustomModule, className: 'p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 shadow-xl', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: '+ Create New Custom Module' }),
        d.jsxs('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4', children: [
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Module Key (e.g. STUDENTS)' }),
            d.jsx('input', {
              type: 'text',
              value: customModuleForm.moduleKey,
              onChange: e => setCustomModuleForm({ ...customModuleForm, moduleKey: e.target.value.toUpperCase() }),
              placeholder: 'STUDENTS',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Module Name' }),
            d.jsx('input', {
              type: 'text',
              value: customModuleForm.name,
              onChange: e => setCustomModuleForm({ ...customModuleForm, name: e.target.value }),
              placeholder: 'Students Directory',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Singular Name' }),
            d.jsx('input', {
              type: 'text',
              value: customModuleForm.singularName,
              onChange: e => setCustomModuleForm({ ...customModuleForm, singularName: e.target.value }),
              placeholder: 'Student',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]})
        ]}),
        d.jsx('button', { type: 'submit', disabled: loading, className: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30', children: loading ? 'Creating...' : 'Create Custom Module' })
      ]}),
      d.jsxs('div', { className: 'p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: 'Workspace Active Modules' }),
        d.jsx('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3', children: modulesList.map(m => d.jsxs('div', {
          key: m.id || m.moduleKey,
          className: 'p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between',
          children: [
            d.jsxs('div', { className: 'space-y-0.5', children: [
              d.jsx('div', { className: 'text-xs font-bold text-white', children: m.name || m.moduleKey }),
              d.jsx('div', { className: 'text-[10px] text-slate-400 font-mono', children: m.isCustom ? 'CUSTOM MODULE' : 'BUILT-IN MODULE' })
            ]}),
            d.jsx('span', { className: \`px-2 py-1 text-[10px] font-extrabold rounded-full \${m.enabled !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}\`, children: m.enabled !== false ? 'ACTIVE' : 'DISABLED' })
          ]
        })) })
      ]})
    ]}),

    activeTab === 'fields' && d.jsxs('div', { className: 'space-y-6 animate-fade-in', children: [
      d.jsxs('form', { onSubmit: handleCreateCustomField, className: 'p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 shadow-xl', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: '+ Add Custom Field' }),
        d.jsxs('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4', children: [
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Module Key' }),
            d.jsx('input', {
              type: 'text',
              value: customFieldForm.entityType,
              onChange: e => setCustomFieldForm({ ...customFieldForm, entityType: e.target.value.toUpperCase() }),
              placeholder: 'LEAD, DEALS, PROPERTIES, STUDENTS',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Field Label' }),
            d.jsx('input', {
              type: 'text',
              value: customFieldForm.fieldName,
              onChange: e => setCustomFieldForm({ ...customFieldForm, fieldName: e.target.value }),
              placeholder: 'Property Price, Course Name',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Field Type' }),
            d.jsx('select', {
              value: customFieldForm.fieldType,
              onChange: e => setCustomFieldForm({ ...customFieldForm, fieldType: e.target.value }),
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500',
              children: ['TEXT', 'LONG_TEXT', 'NUMBER', 'CURRENCY', 'PERCENTAGE', 'DATE', 'DATETIME', 'EMAIL', 'PHONE', 'URL', 'CHECKBOX', 'DROPDOWN', 'MULTI_SELECT', 'USER', 'RELATION'].map(ft => d.jsx('option', { key: ft, value: ft, children: ft }))
            })
          ]})
        ]}),
        customFieldForm.fieldType === 'DROPDOWN' && d.jsxs('div', { className: 'space-y-1', children: [
          d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Dropdown Options (Comma separated)' }),
          d.jsx('input', {
            type: 'text',
            value: customFieldForm.optionsStr,
            onChange: e => setCustomFieldForm({ ...customFieldForm, optionsStr: e.target.value }),
            placeholder: 'Option A, Option B, Option C',
            className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
          })
        ]}),
        d.jsx('button', { type: 'submit', disabled: loading, className: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30', children: loading ? 'Saving...' : 'Add Custom Field' })
      ]}),
      d.jsxs('div', { className: 'p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: 'Existing Workspace Custom Fields' }),
        d.jsx('div', { className: 'space-y-2', children: customFieldsList.map(cf => d.jsxs('div', {
          key: cf.id,
          className: 'p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs',
          children: [
            d.jsxs('div', { className: 'space-y-0.5', children: [
              d.jsx('span', { className: 'font-bold text-white mr-2', children: cf.fieldName }),
              d.jsx('span', { className: 'px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-mono rounded-md', children: cf.entityType }),
              d.jsx('span', { className: 'ml-2 text-slate-400 font-mono text-[10px]', children: cf.fieldKey })
            ]}),
            d.jsx('span', { className: 'px-2 py-1 bg-indigo-600/30 text-indigo-300 font-bold text-[10px] rounded-lg', children: cf.fieldType })
          ]
        })) })
      ]})
    ]}),

    activeTab === 'pipelines' && d.jsxs('div', { className: 'space-y-6 animate-fade-in', children: [
      d.jsxs('form', { onSubmit: handleCreatePipeline, className: 'p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 shadow-xl', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: '+ Create Custom Pipeline' }),
        d.jsxs('div', { className: 'space-y-1', children: [
          d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Pipeline Name' }),
          d.jsx('input', {
            type: 'text',
            value: pipelineForm.name,
            onChange: e => setPipelineForm({ ...pipelineForm, name: e.target.value }),
            placeholder: 'Real Estate Sales Pipeline',
            className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
          })
        ]}),
        d.jsx('button', { type: 'submit', disabled: loading, className: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30', children: loading ? 'Creating...' : 'Create Pipeline' })
      ]}),
      d.jsxs('div', { className: 'p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: 'Active Workspace Pipelines' }),
        d.jsx('div', { className: 'space-y-3', children: pipelinesList.map(p => d.jsxs('div', {
          key: p.id,
          className: 'p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2',
          children: [
            d.jsx('h3', { className: 'text-xs font-bold text-white', children: p.name }),
            d.jsx('div', { className: 'flex flex-wrap gap-2', children: (p.stages || []).map(s => d.jsx('span', {
              key: s.id || s.name,
              style: { backgroundColor: (s.color || '#3b82f6') + '33', color: s.color || '#60a5fa', borderColor: (s.color || '#3b82f6') + '55' },
              className: 'px-3 py-1 border text-[11px] font-bold rounded-lg',
              children: s.name + ' (' + (s.probability || 20) + '%)'
            })) })
          ]
        })) })
      ]})
    ]}),

    activeTab === 'roles' && d.jsxs('div', { className: 'space-y-6 animate-fade-in', children: [
      d.jsxs('form', { onSubmit: handleInviteUser, className: 'p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 shadow-xl', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: '+ Invite Team Member to Workspace' }),
        d.jsxs('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4', children: [
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Full Name' }),
            d.jsx('input', {
              type: 'text',
              value: userInviteForm.fullName,
              onChange: e => setUserInviteForm({ ...userInviteForm, fullName: e.target.value }),
              placeholder: 'Jane Smith',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Email Address' }),
            d.jsx('input', {
              type: 'email',
              value: userInviteForm.email,
              onChange: e => setUserInviteForm({ ...userInviteForm, email: e.target.value }),
              placeholder: 'jane@company.com',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Assign Role' }),
            d.jsx('select', {
              value: userInviteForm.roleName,
              onChange: e => setUserInviteForm({ ...userInviteForm, roleName: e.target.value }),
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500',
              children: ['OWNER', 'ADMIN', 'MANAGER', 'SALES', 'SUPPORT', 'VIEWER'].map(r => d.jsx('option', { key: r, value: r, children: r }))
            })
          ]})
        ]}),
        d.jsx('button', { type: 'submit', disabled: loading, className: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30', children: loading ? 'Inviting...' : 'Send Invite' })
      ]}),
      d.jsxs('div', { className: 'p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4', children: [
        d.jsx('h2', { className: 'text-base font-bold text-white', children: 'Workspace Team Members' }),
        d.jsx('div', { className: 'space-y-2', children: usersList.map(u => d.jsxs('div', {
          key: u.id,
          className: 'p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs',
          children: [
            d.jsxs('div', { className: 'space-y-0.5', children: [
              d.jsx('div', { className: 'font-bold text-white', children: u.fullName }),
              d.jsx('div', { className: 'text-slate-400 font-mono text-[10px]', children: u.email })
            ]}),
            d.jsx('span', { className: 'px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-[10px] rounded-full', children: u.role || 'MEMBER' })
          ]
        })) })
      ]})
    ]}),

    showWizard && d.jsx('div', { className: 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4', children: d.jsxs('div', { className: 'bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-scale-up', children: [
      d.jsxs('div', { className: 'flex items-center justify-between border-b border-slate-800 pb-4', children: [
        d.jsxs('div', { children: [
          d.jsx('h2', { className: 'text-lg font-black text-white', children: 'Create Your CRM Workspace' }),
          d.jsx('p', { className: 'text-xs text-slate-400', children: 'Step ' + wizardStep + ' of 3 - Provision an isolated CRM instance' })
        ]}),
        d.jsx('button', { onClick: () => setShowWizard(false), className: 'text-slate-400 hover:text-white font-black text-lg p-2', children: '✕' })
      ]}),
      wizardStep === 1 && d.jsxs('div', { className: 'space-y-4', children: [
        d.jsxs('div', { className: 'space-y-1', children: [
          d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Company / CRM Workspace Name' }),
          d.jsx('input', {
            type: 'text',
            value: wizardForm.companyName,
            onChange: e => setWizardForm({ ...wizardForm, companyName: e.target.value }),
            placeholder: 'Acme Sales CRM',
            className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
          })
        ]}),
        d.jsxs('div', { className: 'grid grid-cols-2 gap-4', children: [
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Owner Email' }),
            d.jsx('input', {
              type: 'email',
              value: wizardForm.email,
              onChange: e => setWizardForm({ ...wizardForm, email: e.target.value }),
              placeholder: 'owner@company.com',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]}),
          d.jsxs('div', { className: 'space-y-1', children: [
            d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Password' }),
            d.jsx('input', {
              type: 'password',
              value: wizardForm.password,
              onChange: e => setWizardForm({ ...wizardForm, password: e.target.value }),
              placeholder: '••••••••',
              className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
            })
          ]})
        ]}),
        d.jsx('button', { onClick: () => setWizardStep(2), className: 'w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer', children: 'Next: Choose CRM Template →' })
      ]}),
      wizardStep === 2 && d.jsxs('div', { className: 'space-y-4', children: [
        d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Select CRM Industry Template' }),
        d.jsx('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto scrollbar-none', children: templates.map(t => d.jsxs('div', {
          key: t.key,
          onClick: () => setWizardForm({ ...wizardForm, template: t.key }),
          className: \`p-3 bg-slate-800 rounded-xl border cursor-pointer transition \${wizardForm.template === t.key ? 'border-indigo-500 bg-indigo-600/20' : 'border-slate-700/60 hover:border-slate-600'}\`,
          children: [
            d.jsx('div', { className: 'text-xs font-bold text-white', children: t.name }),
            d.jsx('div', { className: 'text-[10px] text-slate-400 leading-tight mt-1', children: t.desc })
          ]
        })) }),
        d.jsxs('div', { className: 'flex items-center justify-between gap-3', children: [
          d.jsx('button', { onClick: () => setWizardStep(1), className: 'px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl', children: '← Back' }),
          d.jsx('button', { onClick: () => setWizardStep(3), className: 'px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl', children: 'Next: Review & Launch →' })
        ]})
      ]}),
      wizardStep === 3 && d.jsxs('div', { className: 'space-y-4', children: [
        d.jsxs('div', { className: 'p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2 text-xs', children: [
          d.jsx('div', { className: 'font-bold text-white', children: 'Workspace Summary' }),
          d.jsxs('div', { className: 'text-slate-300', children: ['Company: ', d.jsx('strong', { className: 'text-indigo-300', children: wizardForm.companyName })] }),
          d.jsxs('div', { className: 'text-slate-300', children: ['Owner Email: ', d.jsx('strong', { className: 'text-indigo-300', children: wizardForm.email })] }),
          d.jsxs('div', { className: 'text-slate-300', children: ['Template: ', d.jsx('strong', { className: 'text-indigo-300', children: wizardForm.template })] })
        ]}),
        d.jsxs('div', { className: 'flex items-center justify-between gap-3', children: [
          d.jsx('button', { onClick: () => setWizardStep(2), className: 'px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl', children: '← Back' }),
          d.jsx('button', { onClick: handleProvisionWorkspace, disabled: loading, className: 'px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer', children: loading ? 'Provisioning CRM Workspace...' : '🚀 Create My CRM Workspace' })
        ]})
      ]})
    ]}) })
  ]});
};

const CustomModuleRecordComponent = () => {
  const location = Zi();
  const pathParts = location.pathname.split('/');
  const moduleKey = (pathParts[pathParts.length - 1] || 'CUSTOM').toUpperCase();

  const [records, setRecords] = rt.useState([]);
  const [fields, setFields] = rt.useState([]);
  const [loading, setLoading] = rt.useState(false);
  const [search, setSearch] = rt.useState('');
  const [showAddModal, setShowAddModal] = rt.useState(false);
  const [titleInput, setTitleInput] = rt.useState('');
  const [dynamicData, setDynamicData] = rt.useState({});
  const [notification, setNotification] = rt.useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken') || '';
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
  };

  const showMsg = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = () => {
    setLoading(true);
    const headers = getHeaders();

    fetch('/api/v1/records/' + moduleKey + (search ? '?search=' + encodeURIComponent(search) : ''), { headers })
      .then(r => r.json())
      .then(d => { if (d.records) setRecords(d.records); })
      .catch(() => {});

    fetch('/api/v1/custom-fields?entityType=' + moduleKey, { headers })
      .then(r => r.json())
      .then(d => { if (d.customFields) setFields(d.customFields); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  rt.useEffect(() => {
    fetchData();
  }, [moduleKey, search]);

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!titleInput) {
      showMsg('Title is required');
      return;
    }
    setLoading(true);
    fetch('/api/v1/records/' + moduleKey, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title: titleInput, data: dynamicData })
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        showMsg('Record created successfully!');
        setTitleInput('');
        setDynamicData({});
        setShowAddModal(false);
        fetchData();
      } else {
        showMsg('Error creating record');
      }
    })
    .catch(() => showMsg('Failed to create record'))
    .finally(() => setLoading(false));
  };

  const handleDeleteRecord = (id) => {
    if (!window.confirm('Delete this record?')) return;
    setLoading(true);
    fetch('/api/v1/records/' + moduleKey + '/' + id, {
      method: 'DELETE',
      headers: getHeaders()
    })
    .then(r => r.json())
    .then(d => {
      showMsg('Record deleted');
      fetchData();
    })
    .catch(() => showMsg('Delete failed'))
    .finally(() => setLoading(false));
  };

  return d.jsxs('div', { className: 'p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans', children: [
    d.jsxs('div', { className: 'flex items-center justify-between p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl', children: [
      d.jsxs('div', { className: 'space-y-1', children: [
        d.jsx('span', { className: 'px-3 py-1 bg-indigo-600/30 text-indigo-400 text-xs font-black rounded-full', children: 'CUSTOM CRM MODULE' }),
        d.jsx('h1', { className: 'text-2xl font-black text-white', children: moduleKey + ' RECORDS' }),
        d.jsx('p', { className: 'text-xs text-slate-400', children: 'Manage dynamic records for ' + moduleKey })
      ]}),
      d.jsx('button', {
        onClick: () => setShowAddModal(true),
        className: 'px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer',
        children: '+ Add New ' + moduleKey + ' Record'
      })
    ]}),

    notification && d.jsx('div', { className: 'p-4 bg-indigo-900/80 border border-indigo-500 text-indigo-200 text-xs font-bold rounded-xl', children: notification }),

    d.jsx('div', { className: 'flex items-center space-x-3', children: [
      d.jsx('input', {
        type: 'text',
        value: search,
        onChange: e => setSearch(e.target.value),
        placeholder: 'Search ' + moduleKey + ' records...',
        className: 'px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white w-72 focus:outline-none'
      })
    ]}),

    d.jsxs('div', { className: 'p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4', children: [
      d.jsxs('table', { className: 'w-full text-left border-collapse text-xs', children: [
        d.jsx('thead', { children: d.jsxs('tr', { className: 'border-b border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]', children: [
          d.jsx('th', { className: 'p-3', children: 'Record ID' }),
          d.jsx('th', { className: 'p-3', children: 'Title' }),
          ...fields.map(f => d.jsx('th', { key: f.id, className: 'p-3', children: f.fieldName })),
          d.jsx('th', { className: 'p-3', children: 'Created Date' }),
          d.jsx('th', { className: 'p-3 text-right', children: 'Actions' })
        ]}) }),
        d.jsx('tbody', { children: records.length === 0 ? d.jsx('tr', { children: d.jsx('td', { colSpan: 4 + fields.length, className: 'p-8 text-center text-slate-500 font-bold', children: 'No records found in ' + moduleKey }) }) : records.map(r => d.jsxs('tr', {
          key: r.id,
          className: 'border-b border-slate-800/60 hover:bg-slate-800/40 transition',
          children: [
            d.jsx('td', { className: 'p-3 font-mono text-indigo-400 font-bold', children: r.recordId }),
            d.jsx('td', { className: 'p-3 font-bold text-white', children: r.title }),
            ...fields.map(f => d.jsx('td', { key: f.id, className: 'p-3 text-slate-300', children: String((r.data || {})[f.fieldKey] || '-') })),
            d.jsx('td', { className: 'p-3 text-slate-400 text-[10px]', children: new Date(r.createdAt).toLocaleDateString() }),
            d.jsx('td', { className: 'p-3 text-right', children: d.jsx('button', {
              onClick: () => handleDeleteRecord(r.id),
              className: 'px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 font-bold text-[10px] rounded-lg',
              children: 'Delete'
            }) })
          ]
        })) })
      ]})
    ]}),

    showAddModal && d.jsx('div', { className: 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4', children: d.jsxs('form', {
      onSubmit: handleCreateRecord,
      className: 'bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl',
      children: [
        d.jsxs('div', { className: 'flex items-center justify-between border-b border-slate-800 pb-3', children: [
          d.jsx('h2', { className: 'text-base font-bold text-white', children: '+ Create ' + moduleKey + ' Record' }),
          d.jsx('button', { type: 'button', onClick: () => setShowAddModal(false), className: 'text-slate-400 font-bold', children: '✕' })
        ]}),
        d.jsxs('div', { className: 'space-y-1', children: [
          d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: 'Record Title' }),
          d.jsx('input', {
            type: 'text',
            value: titleInput,
            onChange: e => setTitleInput(e.target.value),
            placeholder: 'Record title...',
            className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
          })
        ]}),
        ...fields.map(f => d.jsxs('div', { key: f.id, className: 'space-y-1', children: [
          d.jsx('label', { className: 'text-xs font-bold text-slate-300', children: f.fieldName }),
          f.fieldType === 'DROPDOWN' && f.options ? d.jsx('select', {
            value: dynamicData[f.fieldKey] || '',
            onChange: e => setDynamicData({ ...dynamicData, [f.fieldKey]: e.target.value }),
            className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white',
            children: [d.jsx('option', { value: '', children: '-- Select --' }), ...(Array.isArray(f.options) ? f.options : []).map(opt => d.jsx('option', { key: opt, value: opt, children: opt }))]
          }) : d.jsx('input', {
            type: f.fieldType === 'NUMBER' || f.fieldType === 'CURRENCY' ? 'number' : f.fieldType === 'DATE' ? 'date' : 'text',
            value: dynamicData[f.fieldKey] || '',
            onChange: e => setDynamicData({ ...dynamicData, [f.fieldKey]: e.target.value }),
            placeholder: f.fieldName,
            className: 'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500'
          })
        ]})),
        d.jsx('button', { type: 'submit', disabled: loading, className: 'w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer', children: loading ? 'Saving...' : 'Save Record' })
      ]
    }) })
  ]});
};
`;

// Insert the component definitions into bundle before `FD()`
const fdMarker = 'function FD()';
if (!content.includes(fdMarker)) {
  console.error('Could not find FD() marker in bundle!');
  process.exit(1);
}

// Update the `h` array in `_D` sidebar to include CRM BUILDER & custom modules link
const oldSidebarSection = `title:"TOOLS & SETTINGS",items:[{name:"Storage",path:"/storage",icon:nD},{name:"Greetings",path:"/greetings",icon:eD},{name:"General Settings",path:"/settings",icon:p_},{name:"WhatsApp",path:"/whatsapp",icon:cD},{name:"Email",path:"/email",icon:lD},{name:"SMS",path:"/sms",icon:hD},{name:"Platform Admin",path:"/admin",icon:mD}]`;

const newSidebarSection = `title:"SAAS PLATFORM & CRM BUILDER",items:[{name:"CRM Builder",path:"/crm-builder",icon:p_},{name:"Platform Admin",path:"/admin",icon:mD}]},{title:"TOOLS & SETTINGS",items:[{name:"Storage",path:"/storage",icon:nD},{name:"Greetings",path:"/greetings",icon:eD},{name:"General Settings",path:"/settings",icon:p_},{name:"WhatsApp",path:"/whatsapp",icon:cD},{name:"Email",path:"/email",icon:lD},{name:"SMS",path:"/sms",icon:hD}]`;

if (content.includes(oldSidebarSection)) {
  content = content.replace(oldSidebarSection, newSidebarSection);
  console.log('Successfully updated sidebar items in _D!');
} else {
  console.warn('Could not find exact oldSidebarSection string in bundle, searching partial pattern...');
}

// Add the components before FD()
content = content.replace(fdMarker, componentsJs + '\n' + fdMarker);

// Update FD() router to mount /crm-builder and /custom-module/:moduleKey routes
const oldRouterCode = `d.jsx(oe,{path:"/dashboard",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})})`;

const newRouterCode = `d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CRMBuilderComponent,{})})})}),d.jsx(oe,{path:"/builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CRMBuilderComponent,{})})})}),d.jsx(oe,{path:"/custom-module/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/records/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/dashboard",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})})`;

if (content.includes(oldRouterCode)) {
  content = content.replace(oldRouterCode, newRouterCode);
  console.log('Successfully mounted /crm-builder and /custom-module/:moduleKey routes in FD()!');
} else {
  console.error('Could not find oldRouterCode in bundle!');
  process.exit(1);
}

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Patched bundle size:', content.length, 'bytes');
console.log('Frontend bundle successfully patched!');
