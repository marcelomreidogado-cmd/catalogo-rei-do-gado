/** CONFIGURAÇÃO: copie aqui o objeto do Console Firebase > Configurações > Seus apps. */
export const CONFIG = {
  firebase: {
    projectId: "gen-lang-client-0241129459",
    appId: "1:434319751695:web:6acea23d982f1ab977017a",
    storageBucket: "gen-lang-client-0241129459.firebasestorage.app",
    apiKey: "AIzaSyBOXGoC-5fGX9QAD7MP9LVQILbpiwBM4sE",
    authDomain: "gen-lang-client-0241129459.firebaseapp.com",
    messagingSenderId: "434319751695",
  },
  // Sem projectId, funciona apenas como demonstração local. Nenhum pedido é enviado.
  demo: false,
  databaseId: "catalogo",
  imageMode: "firestore", // 'firestore' = Base64 comprimido; 'storage' exige plano Blaze.
  firebaseSdkVersion: "12.19.0",
  adminEmail: "administracao@reidogadocatalogo.invalid",
  demoPassword: "demo123456", // Somente demonstração; nunca use a senha real aqui.
  branches: [
    {
      id: "coronel",
      name: "Coronel",
      neighborhood: "Coronel Veiga",
      address: "Rua Coronel Veiga, 298 • Petrópolis",
      whatsapp: "5524992177114",
    },
    {
      id: "bingen",
      name: "Bingen",
      neighborhood: "Bingen",
      address: "Petrópolis • RJ",
      whatsapp: "552420171476",
    },
    {
      id: "correas",
      name: "Corrêas",
      neighborhood: "Corrêas",
      address: "Petrópolis • RJ",
      whatsapp: "5524981754161",
    },
  ],
  maxCartLines: 10,
  maxImageBytes: 180000,
  contactEmail: "",
  // Em produção, a senha é criada no Firebase Authentication, NUNCA neste arquivo.
};
