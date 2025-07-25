<<<<<<< HEAD
/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Contexto para autenticação e Firestore
const AuthContext = createContext(null);

// Componente principal da aplicação Educar RTS
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Use as variáveis globais __firebase_config e __app_id
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // Fallback para desenvolvimento local se as variáveis globais não estiverem disponíveis
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Efeito para inicializar o Firebase e configurar o listener de autenticação
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      getAnalytics(app);

      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setUserId(currentUser.uid);
          // Tenta carregar as preferências do usuário
          const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUser.uid}/user_preferences`, 'settings');
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setDarkMode(docSnap.data().darkMode || false);
          }
        } else {
          setUser(null);
          setUserId(null);
        }
        setIsAuthReady(true);
      });

      // Autentica com token personalizado se disponível, caso contrário, anonimamente
      if (typeof __initial_auth_token !== 'undefined') {
        // Ensure signInWithCustomToken is imported if used
        // import { signInWithCustomToken } from 'firebase/auth';
        // await signInWithCustomToken(firebaseAuth, __initial_auth_token).catch(err => console.error("Erro ao autenticar com token personalizado:", err));
        // For now, sticking to signInAnonymously as custom token is not in imports
        signInAnonymously(firebaseAuth).catch(err => console.error("Erro ao autenticar anonimamente:", err));
      } else {
        signInAnonymously(firebaseAuth).catch(err => console.error("Erro ao autenticar anonimamente:", err));
      }

      return () => unsubscribe();
    } catch (error) {
      console.error("Erro ao inicializar Firebase:", error);
    }
  }, []); // Dependências vazias para rodar apenas uma vez na montagem

  // Efeito para salvar a preferência de tema do usuário no Firestore
  useEffect(() => {
    // Garante que db, userId e auth estejam prontos antes de tentar salvar
    if (db && userId && isAuthReady) {
      const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/user_preferences`, 'settings');
      setDoc(userDocRef, { darkMode }, { merge: true }).catch(error => {
        console.error("Erro ao salvar preferência de tema:", error);
      });
    }
  }, [darkMode, db, userId, isAuthReady, appId]); // Adicionado appId às dependências

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setUser(null);
        setUserId(null);
        setDarkMode(false); // Reset dark mode on logout
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId, db, auth, isAuthReady, setShowAuthModal }}>
      <div className={`${darkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen font-inter transition-colors duration-300`}>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          user={user}
        />

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

        <main className="container mx-auto px-4 py-8">
          <HeroSection />
          <FeatureOverview /> {/* Renomeado para FeatureOverview */}
          <CourseTypesSection /> {/* Nova seção de tipos de curso */}
          <BenefitsSection /> {/* Nova seção de benefícios */}
          <TestimonialSection /> {/* Nova seção de depoimentos */}

          {/* Seções placeholder para futuras páginas */}
          <section id="blog" className="py-20 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">Nosso Blog</h2>
            <p className="text-lg text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
              Fique por dentro das últimas notícias e tendências do mundo da TI. Em breve, novos artigos e insights para impulsionar sua carreira!
            </p>
          </section>
          <section id="sobre" className="py-20 text-center bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl mt-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">Sobre o Educar RTS</h2>
            <p className="text-lg text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
              Nossa missão é tornar o aprendizado de tecnologia acessível, inclusivo e motivador para todos.
              Acreditamos que a educação digital é a chave para transformar vidas e construir um futuro mais conectado e igualitário.
              Oferecemos uma plataforma moderna, responsiva e pensada para te acompanhar em cada passo da sua jornada.
            </p>
          </section>
          <section id="contato" className="py-20 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">Fale Conosco</h2>
            <p className="text-lg text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
              Tem dúvidas, sugestões ou quer saber mais sobre nossas trilhas? Entre em contato conosco!
              Estamos sempre prontos para ajudar.
            </p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8">
              Email: <a href="mailto:contato@educarrts.com" className="text-sky-500 hover:underline">contato@educarrts.com</a>
            </p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Telefone: (XX) XXXX-XXXX
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </AuthContext.Provider>
  );
};

// Componente do Cabeçalho da página
const Header = ({ darkMode, toggleDarkMode, onLoginClick, onLogout, user }) => {
  return (
    <header className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 shadow-md rounded-b-2xl">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Educar RTS</h1>
        <nav className="flex items-center space-x-6 mt-4 md:mt-0" role="navigation" aria-label="Navegação Principal">
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#cursos">Cursos</NavLink> {/* Atualizado */}
          <NavLink href="#precos">Preços</NavLink> {/* Atualizado */}
          <NavLink href="#sobre">Sobre Nós</NavLink> {/* Atualizado */}
          {/* Botão para alternar o modo claro/escuro */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all duration-300"
            aria-label={darkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.325 5.325l-.707.707M6.364 6.364l-.707-.707m12.728 0l-.707.707M6.364 17.636l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"></path></svg>
            )}
          </button>
          {user ? (
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
              aria-label="Sair da conta"
            >
              Sair
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-6 py-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-md"
              aria-label="Entrar ou Cadastrar"
            >
              Cadastre-se
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

// Componente de Link de Navegação
const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-gray-800 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
  >
    {children}
  </a>
);

// Componente da Seção Hero
const HeroSection = () => {
  return (
    <section id="home" className="py-24 md:py-32 text-center relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Aprenda Virtualmente <span className="text-sky-500">Conosco!</span>
        </h2>
        <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-300 mb-12 max-w-4xl mx-auto">
          Expanda seu conhecimento e habilidades através de nossos programas de aprendizado dinâmicos e envolventes.
          Nossos instrutores especializados estão aqui para ajudá-lo a alcançar seus objetivos educacionais de qualquer lugar.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="px-10 py-5 bg-sky-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-sky-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-75"
                  aria-label="Comece Agora">
            Comece Agora
          </button>
          <button className="px-10 py-5 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-bold text-xl rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-75"
                  aria-label="Assistir Vídeo">
            Assistir Vídeo
          </button>
        </div>
      </div>
    {/* Imagem de fundo / Colagem de pessoas (simulada) */}
<div className="absolute inset-0 w-full h-full flex items-center justify-center -z-0">
  <div className="relative w-full h-full max-w-6xl mx-auto">
    {/* Main large image - Changed from url(../) to a web URL */}
    <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-blue-200 dark:bg-blue-800 rounded-3xl shadow-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
         style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover' }}></div>
    
    {/* Smaller images around - Replaced placehold.co with web URLs */}
    <div className="absolute w-32 h-32 md:w-40 md:h-40 bg-green-200 dark:bg-green-800 rounded-3xl shadow-lg top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-70"
         style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-e695c0c88593?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover' }}></div>
    
    <div className="absolute w-32 h-32 md:w-40 md:h-40 bg-purple-200 dark:bg-purple-800 rounded-3xl shadow-lg bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-70"
         style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover' }}></div>
    
    <div className="absolute w-24 h-24 md:w-32 md:h-32 bg-orange-200 dark:bg-orange-800 rounded-3xl shadow-lg top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 opacity-70"
         style={{ backgroundImage: `url('https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover' }}></div>
    
    <div className="absolute w-24 h-24 md:w-32 md:h-32 bg-red-200 dark:bg-red-800 rounded-3xl shadow-lg bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 opacity-70"
         style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover' }}></div>
  </div>
</div>
    </section>
  );
};

// Componente de Visão Geral de Funcionalidades (Audio & Video, Virtual Classroom, Group Learning)
const FeatureOverview = () => {
  const features = [
    {
      title: 'Aulas em Áudio e Vídeo',
      description: 'Inclui aulas de áudio e vídeo para todos os cursos.',
      icon: (
        <svg className="w-16 h-16 text-sky-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4-4m0 0l-4-4m4 4H9m11 4v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h11.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V14"></path>
        </svg>
      ),
    },
    {
      title: 'Sala de Aula Virtual',
      description: 'Um lugar para socializar seu computador ou celular.',
      icon: (
        <svg className="w-16 h-16 text-emerald-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13V6a2 2 0 012-2h14a2 2 0 012 2v7m-4 0v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m6 0H9"></path>
        </svg>
      ),
    },
    {
      title: 'Aprendizado em Grupo',
      description: 'Um lugar para socializar seu computador ou celular.',
      icon: (
        <svg className="w-16 h-16 text-purple-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V7.5a2.5 2.5 0 00-2.5-2.5h-10A2.5 2.5 0 005 7.5V18a2 2 0 002 2h2m0-3v3m0 0h3.5M9 12h.01M12 12h.01M15 12h.01M17 12h.01"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 border-t-4 border-transparent hover:border-sky-500 dark:hover:border-emerald-500"
          >
            {feature.icon}
            <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{feature.title}</h3>
            {/* Alterado de text-gray-600 para text-gray-800 para melhor contraste no tema claro */}
            <p className="text-gray-800 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Componente para o Card de Curso
const CourseCard = ({ image, title, rating, price, category }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/cccccc/000000?text=Curso`; }} />
      <div className="p-6">
        {/* Alterado de text-gray-500 para text-gray-700 para melhor contraste no tema claro */}
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2 block">{category}</span>
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <div className="flex items-center mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
            </svg>
          ))}
          {/* Alterado de text-gray-600 para text-gray-700 para melhor contraste no tema claro */}
          <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">{rating}.0</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{price}</span>
          <button className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md">
            Matricule-se Agora
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Tipos de Curso
const CourseTypesSection = () => {
  const [activeTab, setActiveTab] = useState('programacao');

  const courses = {
    programacao: [
      { image: 'https://placehold.co/400x200/a8dadc/000000?text=Web+Dev', title: 'Desenvolvimento Web', rating: 4, price: '€69.50' },
      { image: 'https://placehold.co/400x200/457b9d/FFFFFF?text=Mobile+Dev', title: 'Desenvolvimento Mobile', rating: 5, price: '€79.99' },
      { image: 'https://placehold.co/400x200/1d3557/FFFFFF?text=Backend+Dev', title: 'Backend com Node.js', rating: 4, price: '€74.00' },
    ],
    design: [
      { image: 'https://placehold.co/400x200/e63946/FFFFFF?text=Graphic+Design', title: 'Design Gráfico', rating: 5, price: '€59.00' },
      { image: 'https://placehold.co/400x200/f4a261/000000?text=UX/UI+Design', title: 'UX/UI Design', rating: 4, price: '€65.90' },
      { image: 'https://placehold.co/400x200/2a9d8f/FFFFFF?text=Motion+Design', title: 'Motion Design', rating: 4, price: '€62.50' },
    ],
    desenvolvimento: [
      { image: 'https://placehold.co/400x200/264653/FFFFFF?text=Python', title: 'Python para Data Science', rating: 5, price: '€85.00' },
      { image: 'https://placehold.co/400x200/2a9d8f/FFFFFF?text=Java', title: 'Programação Java', rating: 4, price: '€70.00' },
      { image: 'https://placehold.co/400x200/e9c46a/000000?text=React', title: 'React Essencial', rating: 5, price: '€75.00' },
    ],
    marketing: [
      { image: 'https://placehold.co/400x200/8d99ae/FFFFFF?text=Digital+Marketing', title: 'Marketing Digital', rating: 4, price: '€49.00' },
      { image: 'https://placehold.co/400x200/ef233c/FFFFFF?text=SEO', title: 'SEO Avançado', rating: 5, price: '€55.00' },
      { image: 'https://placehold.co/400x200/d90429/FFFFFF?text=Social+Media', title: 'Gestão de Redes Sociais', rating: 4, price: '€45.00' },
    ],
  };

  return (
    <section id="cursos" className="py-20 bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl mb-20">
      <h2 className="text-4xl lg:text-5xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">Oferecemos Diversos Tipos de Cursos</h2>
      
      <div className="flex justify-center mb-10 space-x-4">
        {Object.keys(courses).map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300
              ${activeTab === category
                ? 'bg-sky-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {courses[activeTab].map((course, index) => (
          <CourseCard
            key={index}
            image={course.image}
            title={course.title}
            rating={course.rating}
            price={course.price}
            category={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          />
        ))}
      </div>
    </section>
  );
};

// Componente de Benefícios do Aprendizado
const BenefitsSection = () => {
  const benefits = [
    'Mais de 1000 cursos estabelecidos',
    'Mais de 100 aulas',
    'Mais de 200+ vídeos gratuitos',
    'Mais de 100+ instrutores qualificados',
    'Preço mais acessível',
    'Horário de estudo mais flexível',
  ];

  return (
    <section className="py-20 flex flex-col lg:flex-row items-center gap-16">
      <div className="lg:w-1/2 text-center lg:text-left">
        <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-gray-800 dark:text-gray-100">Benefícios de Aprender Conosco</h2>
        <ul className="space-y-4 text-lg text-gray-800 dark:text-gray-300">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center lg:justify-start justify-center">
              <svg className="w-6 h-6 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:w-1/2 flex justify-center">
        {/* Imagem de um aluno aprendendo */}
        <img
          src="https://placehold.co/500x500/ADD8E6/000000?text=Aluno+Aprendendo"
          alt="Aluno aprendendo"
          className="rounded-2xl shadow-2xl w-full max-w-md"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/500x500/cccccc/000000?text=Aluno`; }}
        />
      </div>
    </section>
  );
};

// Componente de Depoimentos de Alunos
const TestimonialSection = () => {
  const testimonials = [
    {
      name: 'John Doe',
      text: 'Este é um dos melhores sites para estudar online. Eu recomendo muito!',
      image: 'https://placehold.co/80x80/FFB6C1/000000?text=JD',
    },
    {
      name: 'Jane Smith',
      text: 'A plataforma é incrível e os instrutores são muito experientes. Aprendi muito!',
      image: 'https://placehold.co/80x80/90EE90/000000?text=JS',
    },
    {
      name: 'Peter Jones',
      text: 'Conteúdo de alta qualidade e muito bem organizado. Vale a pena cada centavo!',
      image: 'https://placehold.co/80x80/ADD8E6/000000?text=PJ',
    },
  ];

  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl lg:text-5xl font-bold mb-12 text-gray-800 dark:text-gray-100">O Que Nossos Alunos Dizem</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-sm flex flex-col items-center text-center">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-20 h-20 rounded-full object-cover mb-6 shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/cccccc/000000?text=User`; }}
            />
            {/* Alterado de text-gray-700 para text-gray-800 para melhor contraste no tema claro */}
            <p className="text-lg text-gray-800 dark:text-gray-300 mb-4 italic">"{testimonial.text}"</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};


// Componente do Rodapé da página
const Footer = () => {
  const { userId } = useContext(AuthContext);

  return (
    <footer className="bg-gray-950 dark:bg-gray-900 text-gray-400 p-12 rounded-t-2xl shadow-inner">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Educar RTS</h3>
          <p className="text-sm mb-2">
            <strong className="text-gray-200">Missão:</strong> Tornar o aprendizado de TI acessível, inclusivo e eficaz para todos.
          </p>
          <p className="text-sm mb-2">
            <strong className="text-gray-200">Visão:</strong> Ser referência no ensino online gratuito e acessível de tecnologia.
          </p>
          <p className="text-sm">
            <strong className="text-gray-200">Valores:</strong> Educação, inclusão digital, acessibilidade, inovação e empatia.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Contato</h3>
          <p className="text-sm">Email: contato@educarrts.com</p>
          <p className="text-sm">Telefone: (XX) XXXX-XXXX</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-gray-500 hover:text-gray-200 transition-colors duration-300" aria-label="Facebook">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.247 0-1.646.779-1.646 1.562V12h2.77l-.443 2.89h-2.327v6.987C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-200 transition-colors duration-300" aria-label="Twitter">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.162 5.658a8.154 8.154 0 01-2.357.646 4.084 4.084 0 001.8-2.277 8.16 8.16 0 01-2.587.985 4.075 4.075 0 00-6.983 3.71A11.59 11.59 0 013.374 4.909a4.074 4.074 0 001.26 5.438 4.067 4.067 0 01-1.845-.508v.051a4.085 4.085 0 003.267 4.004 4.07 4.07 0 01-1.83.07A4.082 4.082 0 0010.51 17.5c-3.19 2.11-7.19 3.2-11.58 2.84 4.38 2.803 9.61 4.444 15.19 4.444 18.23 0 28.2-15.093 28.2-28.2 0-.43-.01-.85-.02-1.27z" /></svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-200 transition-colors duration-300" aria-label="LinkedIn">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Links Rápidos</h3>
          <ul>
            <li className="mb-2"><a href="#trilhas" className="hover:text-gray-200 transition-colors duration-300">Trilhas de Aprendizado</a></li>
            <li className="mb-2"><a href="#blog" className="hover:text-gray-200 transition-colors duration-300">Blog</a></li>
            <li className="mb-2"><a href="#sobre" className="hover:text-gray-200 transition-colors duration-300">Sobre Nós</a></li>
            <li className="mb-2"><a href="#contato" className="hover:text-gray-200 transition-colors duration-300">Fale Conosco</a></li>
            <li className="mb-2"><a href="#" className="hover:text-gray-200 transition-colors duration-300">FAQ</a></li>
          </ul>
        </div>
      </div>
      {userId && (
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>ID do Usuário: <span className="font-mono">{userId}</span></p>
        </div>
      )}
      <div className="mt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Educar RTS. Todos os direitos reservados.
      </div>
    </footer>
  );
};

// Componente do Modal de Autenticação
const AuthModal = ({ onClose }) => {
  const { auth, setShowAuthModal } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Use Firebase authentication for login
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login bem-sucedido!");
        setShowAuthModal(false);
      } else {
        // Use Firebase authentication for registration
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Registro bem-sucedido! Você pode fazer login agora.");
        setIsLogin(true); // Switch to login form after successful registration
      }
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
      console.error("Erro de autenticação:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
         role="dialog"
         aria-modal="true"
         aria-labelledby="auth-modal-title">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 w-full max-w-md relative border-t-8 border-sky-500">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          aria-label="Fechar modal de autenticação"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 id="auth-modal-title" className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </h2>
        {message && (
          <div className={`p-3 mb-6 rounded-lg text-sm ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'} dark:bg-opacity-20`}
               role="status" aria-live="polite">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-800 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
              Senha:
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-800 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isLogin ? 'Entrar' : 'Cadastrar'
            )}
          </button>
          <p className="text-center text-gray-800 dark:text-gray-300 text-sm mt-6">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sky-500 hover:underline ml-1 font-semibold"
            >
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
=======
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
>>>>>>> salvar-primeira-versao

export default App;
