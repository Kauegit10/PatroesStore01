
import React, { useState, useEffect } from 'react';
import { 
  SiteUser, Product, AppView 
} from './types';
import { 
  User, Menu, X, ShieldCheck,
  Store, Package, ShoppingCart, 
  UserPlus, LogIn, Key, ImagePlus
} from 'lucide-react';

const STORAGE_VER = "v103"; 

const ADMIN_ACCOUNTS = [
  { email: "negocpm@gmail.com", password: "negocpm", name: "Nego CPM" },
  { email: "souzavendas@gmail.com", password: "souzavendas", name: "Souza Vendas" }
];

const App: React.FC = () => {
  const [siteUser, setSiteUser] = useState<SiteUser | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  
  const [currentView, setCurrentView] = useState<AppView>('shop');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shopCategory, setShopCategory] = useState<'CPM' | 'MARKETING'>('CPM');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allUsers, setAllUsers] = useState<SiteUser[]>([]);
  
  const [newProdData, setNewProdData] = useState({ 
    name: '', 
    desc: '', 
    price: '', 
    category: 'CPM' as 'CPM' | 'MARKETING',
    vendorPhone: '',
    image: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (e) {
        console.error("Fetch products error:", e);
      }
    };

    try {
      const savedUsers = localStorage.getItem(`webcpm_u_${STORAGE_VER}`);
      const savedSession = localStorage.getItem(`webcpm_s_${STORAGE_VER}`);

      if (savedUsers) setAllUsers(JSON.parse(savedUsers));
      if (savedSession) setSiteUser(JSON.parse(savedSession));
    } catch (e) { console.error("Restore error:", e); }

    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem(`webcpm_u_${STORAGE_VER}`, JSON.stringify(allUsers));
  }, [allUsers]);

  const handleSiteAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    setTimeout(() => {
      const adminAcc = ADMIN_ACCOUNTS.find(a => a.email === authEmail && a.password === authPassword);
      if (adminAcc) {
        const admin: SiteUser = { 
          email: adminAcc.email, 
          password: adminAcc.password, 
          name: adminAcc.name, 
          isAdmin: true, 
          dateJoined: 'ADM' 
        };
        setSiteUser(admin);
        localStorage.setItem(`webcpm_s_${STORAGE_VER}`, JSON.stringify(admin));
        setCurrentView('shop');
      } else if (isRegistering) {
        if (allUsers.some(u => u.email === authEmail) || ADMIN_ACCOUNTS.some(a => a.email === authEmail)) {
          setErrorMsg("Este e-mail já possui cadastro.");
          setLoading(false);
          return;
        }
        const newUser: SiteUser = {
          email: authEmail,
          password: authPassword,
          name: authName,
          dateJoined: new Date().toLocaleDateString()
        };
        const updatedUsers = [...allUsers, newUser];
        setAllUsers(updatedUsers);
        setSiteUser(newUser);
        localStorage.setItem(`webcpm_s_${STORAGE_VER}`, JSON.stringify(newUser));
        setSuccessMsg("CONTA CRIADA COM SUCESSO!");
        setCurrentView('shop');
      } else {
        const user = allUsers.find(u => u.email === authEmail && u.password === authPassword);
        if (user) {
          setSiteUser(user);
          localStorage.setItem(`webcpm_s_${STORAGE_VER}`, JSON.stringify(user));
          setCurrentView('shop');
        } else { 
          setErrorMsg("E-mail ou senha incorretos."); 
        }
      }
      setLoading(false);
    }, 800);
  };

  const handleBuyWhatsApp = (prod: Product) => {
    const phone = prod.vendorPhone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${prod.name} (R$ ${prod.price.toFixed(2)})`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handlePostProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica de link do ImgBB
    if (newProdData.image.includes('ibb.co/') && !newProdData.image.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !newProdData.image.includes('i.ibb.co')) {
      setErrorMsg("O link do ImgBB parece ser de visualização. Use o 'Link Direto' (ex: i.ibb.co/...)");
      return;
    }

    const newP: Product = {
      id: Date.now().toString(),
      name: newProdData.name,
      description: newProdData.desc,
      price: Number(newProdData.price),
      category: newProdData.category,
      image: newProdData.image || 'https://picsum.photos/seed/' + Date.now() + '/400/200',
      vendorPhone: newProdData.vendorPhone
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
      if (res.ok) {
        setProducts([newP, ...products]);
        setNewProdData({ name: '', desc: '', price: '', category: 'CPM', vendorPhone: '', image: '' });
        setSuccessMsg("PRODUTO CADASTRADO COM SUCESSO!");
      } else {
        setErrorMsg("Erro ao salvar produto no servidor.");
      }
    } catch (e) {
      setErrorMsg("Falha na conexão com o servidor.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("A imagem é muito grande. Use uma foto de até 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdData({ ...newProdData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!siteUser) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#121214] border border-white/5 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
          <div className="text-center mb-10">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">PATRÕES STORE</h1>
            <p className="text-emerald-500 text-[10px] font-black uppercase mt-2 tracking-widest">
              {isRegistering ? 'Nova Conta Web' : 'Acesso ao Painel'}
            </p>
          </div>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-bold uppercase text-center animate-pulse">
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSiteAuth} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Seu Nome" 
                  value={authName} 
                  onChange={e => setAuthName(e.target.value)} 
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  required 
                />
                <UserPlus className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
              </div>
            )}
            
            <div className="relative">
              <input 
                type="email" 
                placeholder="E-mail" 
                value={authEmail} 
                onChange={e => setAuthEmail(e.target.value)} 
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                required 
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
            </div>

            <div className="relative">
              <input 
                type="password" 
                placeholder="Senha" 
                value={authPassword} 
                onChange={e => setAuthPassword(e.target.value)} 
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                required 
              />
              <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-emerald-600 py-5 rounded-2xl text-white font-black uppercase text-[11px] active:scale-95 transition-all shadow-xl shadow-emerald-600/10"
            >
              {loading ? <ShieldCheck className="w-5 h-5 animate-spin mx-auto" /> : (isRegistering ? 'Criar Conta Web' : 'Entrar no Sistema')}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
              className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isRegistering ? (
                <><LogIn className="w-4 h-4"/> Já possui conta? Login</>
              ) : (
                <><UserPlus className="w-4 h-4"/> Não tem conta? Cadastrar</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <nav className="sticky top-0 z-50 bg-[#121214]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('shop')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20"><ShieldCheck className="text-white w-6 h-6" /></div>
          <h2 className="font-black text-lg text-white tracking-tighter uppercase">PATRÕES STORE</h2>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-white active:scale-90 transition-all"><Menu /></button>
      </nav>

      {/* Menu Lateral */}
      <div className={`fixed inset-0 z-[100] ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/95 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-72 bg-[#0e0e10] border-l border-white/5 p-8 flex flex-col transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex-1 space-y-2 mt-10">
            {[
              { id: 'shop', icon: Store, label: 'Loja' },
            ].map(item => (
              <button key={item.id} onClick={() => { setCurrentView(item.id as any); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === item.id ? 'bg-emerald-600 text-white' : 'hover:bg-white/5'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
            {siteUser.isAdmin && (
              <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
                <button onClick={() => { setCurrentView('admin-products'); setIsMenuOpen(false); }} className={`w-full p-4 flex items-center gap-4 text-[10px] font-black uppercase rounded-2xl transition-all ${currentView === 'admin-products' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/5'}`}><Package className="w-5 h-5" /> Postar Produto</button>
              </div>
            )}
          </div>
          <button onClick={() => setSiteUser(null)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px]">Sair do Painel</button>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {successMsg && <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-3xl text-[10px] font-black uppercase flex items-center justify-between">{successMsg}<X className="w-4 h-4 cursor-pointer" onClick={() => setSuccessMsg(null)} /></div>}
        {errorMsg && <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl text-[10px] font-black uppercase flex items-center justify-between">{errorMsg}<X className="w-4 h-4 cursor-pointer" onClick={() => setErrorMsg(null)} /></div>}

        {currentView === 'shop' && (
          <div className="space-y-8">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {['CPM', 'MARKETING'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setShopCategory(cat as any)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${shopCategory === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-10">
              {products.filter(p => p.category === shopCategory).map(p => (
                <div key={p.id} className="bg-zinc-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden group">
                  <div className="h-44 bg-black overflow-hidden relative">
                    <img src={p.image} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{p.category}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-white font-black uppercase text-sm">{p.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mt-2 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between mt-8">
                      <span className="text-2xl font-black text-emerald-500">R$ {p.price.toFixed(2)}</span>
                      <button 
                        onClick={() => handleBuyWhatsApp(p)} 
                        className="p-5 bg-emerald-600 rounded-2xl text-white shadow-lg active:scale-90 transition-all flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase">Comprar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.filter(p => p.category === shopCategory).length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs">
                  Nenhum produto nesta categoria
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'admin-products' && siteUser.isAdmin && (
           <div className="max-w-xl mx-auto bg-zinc-900/40 p-12 rounded-[3.5rem] border border-white/5 animate-in slide-in-from-top-10">
              <h3 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3"><Package className="text-red-500"/> Postar Novo Produto</h3>
              <form onSubmit={handlePostProduct} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewProdData({...newProdData, category: 'CPM'})}
                      className={`p-4 rounded-xl text-[10px] font-black uppercase border transition-all ${newProdData.category === 'CPM' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-500'}`}
                    >CPM</button>
                    <button 
                      type="button"
                      onClick={() => setNewProdData({...newProdData, category: 'MARKETING'})}
                      className={`p-4 rounded-xl text-[10px] font-black uppercase border transition-all ${newProdData.category === 'MARKETING' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-500'}`}
                    >MARKETING</button>
                 </div>
                 <input type="text" placeholder="Nome do Produto" value={newProdData.name} onChange={e => setNewProdData({...newProdData, name:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <textarea placeholder="Descrição" value={newProdData.desc} onChange={e => setNewProdData({...newProdData, desc:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white h-32 resize-none" required />
                 <input type="number" placeholder="Preço (R$)" value={newProdData.price} onChange={e => setNewProdData({...newProdData, price:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 
                 <div className="space-y-2">
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       placeholder="URL da Imagem ou use a Galeria" 
                       value={newProdData.image.startsWith('data:') ? 'Imagem da Galeria Selecionada' : newProdData.image} 
                       onChange={e => setNewProdData({...newProdData, image:e.target.value})} 
                       className="flex-1 bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" 
                     />
                     <label className="bg-zinc-900 border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-all flex items-center justify-center">
                       <ImagePlus className="text-emerald-500 w-6 h-6" />
                       <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                     </label>
                   </div>
                 </div>
                 
                 {newProdData.image && (
                   <div className="mt-2 p-4 bg-zinc-950 rounded-2xl border border-white/5">
                     <p className="text-[8px] text-zinc-500 uppercase font-black mb-2">Pré-visualização:</p>
                     <img 
                       src={newProdData.image} 
                       alt="Preview" 
                       className="w-full h-32 object-contain rounded-xl bg-black"
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/400/200?grayscale';
                       }}
                     />
                     {!newProdData.image.match(/\.(jpg|jpeg|png|gif|webp)$/i) && newProdData.image.includes('ibb.co') && (
                       <p className="text-[8px] text-orange-500 font-bold mt-2 uppercase">⚠️ Atenção: Este link pode não funcionar. Use o "Link Direto" no ImgBB.</p>
                     )}
                   </div>
                 )}

                 <input type="text" placeholder="WhatsApp do Vendedor (Ex: 5511999999999)" value={newProdData.vendorPhone} onChange={e => setNewProdData({...newProdData, vendorPhone:e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-5 rounded-2xl text-sm text-white" required />
                 <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-600/10">Cadastrar no Sistema</button>
              </form>
           </div>
        )}
      </main>

      {loading && (
        <div className="fixed inset-0 z-[500] bg-black/99 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin"></div>
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8"/>
          </div>
          <p className="text-emerald-500 font-black uppercase text-[10px] mt-10 tracking-[0.8em] animate-pulse px-12">Processando Requisição...</p>
        </div>
      )}
    </div>
  );
};

export default App;
