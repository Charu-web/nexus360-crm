const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== UPDATING CreateCrmComponent PAYLOAD IN BUNDLE ===');

const createCrmComponentCode = `
function CreateCrmComponent(){
  const nav=li();
  const {user,login}=Il();
  const [cName,setCName]=rt.useState('');
  const [ind,setInd]=rt.useState('Real Estate');
  const [size,setSize]=rt.useState('1-10 employees');
  const [web,setWeb]=rt.useState('');
  const [err,setErr]=rt.useState(null);
  const [loading,setLoading]=rt.useState(!1);

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!cName.trim()){setErr('Company Name is required.');return;}
    setErr(null);
    setLoading(!0);
    try{
      const token=localStorage.getItem('accessToken');
      const storedUser=localStorage.getItem('leadflow_user')?JSON.parse(localStorage.getItem('leadflow_user')):{};
      const reqPayload={
        companyName:cName.trim(),
        industry:ind,
        companySize:size,
        website:web.trim(),
        fullName:storedUser.fullName||storedUser.name||(user&&user.name)||'CRM Owner',
        email:storedUser.email||(user&&user.email)||'owner@company.com',
        phone:storedUser.phone||'+15550009999',
        password:'Password123!'
      };
      const res=await fetch('/api/v1/provision',{
        method:'POST',
        headers:{'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})},
        body:JSON.stringify(reqPayload)
      });
      const data=await res.json();
      if(!res.ok||!data.success){
        throw new Error(data.message||'Failed to create CRM workspace.');
      }
      if(data.accessToken){
        localStorage.setItem('accessToken',data.accessToken);
      }
      if(data.user){
        localStorage.setItem('leadflow_user',JSON.stringify(data.user));
      }
      window.location.href='/dashboard';
    }catch(hErr){
      setErr(hErr.message||'An error occurred while setting up your CRM.');
    }finally{
      setLoading(!1);
    }
  };

  return d.jsx(Iu,{
    title:"Create Your CRM 👋",
    subtitle:"Set up your workspace and start managing your business.",
    children:d.jsxs("form",{onSubmit:handleSubmit,className:"space-y-4",noValidate:!0,children:[
      err&&d.jsx("div",{className:"p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold leading-relaxed",children:err}),
      d.jsx(ys,{label:"CRM / Company Name *",children:d.jsx("input",{type:"text",value:cName,onChange:(e)=>setCName(e.target.value),className:Si,placeholder:"Acme Corporation",required:!0})}),
      d.jsx(ys,{label:"Industry *",children:d.jsxs("select",{value:ind,onChange:(e)=>setInd(e.target.value),className:Si,children:[
        d.jsx("option",{value:"Real Estate",children:"Real Estate"}),
        d.jsx("option",{value:"Technology",children:"Technology & Software"}),
        d.jsx("option",{value:"Financial Services",children:"Financial Services / Banking"}),
        d.jsx("option",{value:"Healthcare",children:"Healthcare & Medical"}),
        d.jsx("option",{value:"Retail & E-commerce",children:"Retail & E-commerce"}),
        d.jsx("option",{value:"Consulting",children:"Professional Consulting"}),
        d.jsx("option",{value:"Manufacturing",children:"Manufacturing & Construction"})
      ]})}),
      d.jsx(ys,{label:"Company Size",children:d.jsxs("select",{value:size,onChange:(e)=>setSize(e.target.value),className:Si,children:[
        d.jsx("option",{value:"1-10 employees",children:"1 - 10 Employees"}),
        d.jsx("option",{value:"11-50 employees",children:"11 - 50 Employees"}),
        d.jsx("option",{value:"51-200 employees",children:"51 - 200 Employees"}),
        d.jsx("option",{value:"201+ employees",children:"201+ Employees"})
      ]})}),
      d.jsx(ys,{label:"Company Website (Optional)",children:d.jsx("input",{type:"url",value:web,onChange:(e)=>setWeb(e.target.value),className:Si,placeholder:"https://example.com"})}),
      d.jsx("button",{type:"submit",disabled:loading,className:"w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200",children:loading?"Creating Your CRM...":"Create CRM"})
    ]})
  });
}
`;

const singleLineComponent = createCrmComponentCode.replace(/\r?\n\s*/g, '');

// Strip previous definition if present
const cIdx = code.indexOf('function CreateCrmComponent()');
if (cIdx !== -1) {
  code = code.substring(0, cIdx);
}

code += '\n' + singleLineComponent;
fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Successfully updated CreateCrmComponent payload!');
