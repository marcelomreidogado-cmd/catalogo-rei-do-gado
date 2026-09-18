/** CONFIGURAÇÃO: copie aqui o objeto do Console Firebase > Configurações > Seus apps. */
export const CONFIG = {
  firebase: {
    projectId: "rei-do-gado-catalogo-2026",
    appId: "1:3662126261:web:6aa935c1f7dc957a76f2fc",
    storageBucket: "rei-do-gado-catalogo-2026.firebasestorage.app",
    apiKey: "AIzaSyDvyJR5l2o1N4Qjbhlw-P20YNWrTTWHXHI",
    authDomain: "rei-do-gado-catalogo-2026.firebaseapp.com",
    messagingSenderId: "3662126261",
  },
  // Sem projectId, funciona apenas como demonstração local. Nenhum pedido é enviado.
  demo: false,
  databaseId: "catalogo",
  imageMode: "firestore", // 'firestore' = Base64 comprimido; 'storage' exige plano Blaze.
  firebaseSdkVersion: "12.19.0",
  branches: [
    {
      id: "coronel",
      name: "Coronel",
      neighborhood: "Coronel Veiga",
      address: "Rua Coronel Veiga, 298 • Petrópolis",
      whatsapp: "5524992177114",
      email: "coronel@reidogadocatalogo.invalid",
      demoPassword: "coronel123",
    },
    {
      id: "bingen",
      name: "Bingen",
      neighborhood: "Bingen",
      address: "Petrópolis • RJ",
      whatsapp: "552420171476",
      email: "bingen@reidogadocatalogo.invalid",
      demoPassword: "bingen123",
    },
    {
      id: "correas",
      name: "Corrêas",
      neighborhood: "Corrêas",
      address: "Petrópolis • RJ",
      whatsapp: "5524981754161",
      email: "correas@reidogadocatalogo.invalid",
      demoPassword: "correas123",
    },
  ],
  maxCartLines: 10,
  maxImageBytes: 180000,
  contactEmail: "",
  // Em produção, a senha é criada no Firebase Authentication, NUNCA neste arquivo.
};
