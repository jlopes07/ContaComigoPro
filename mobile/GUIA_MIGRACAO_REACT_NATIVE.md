# 📱 Guia de Transposição Técnica: Web → React Native (`ContaComigoProMobile`)

Este documento fornece o mapeamento completo, a arquitetura e as instruções passo a passo para transpôr a aplicação **ContaComigoPro** do formato Web (HTML/CSS/JS SPA) para um aplicativo mobile nativo usando **React Native (Expo / React Native CLI)**.

---

## 1. 📁 Estrutura de Pastas do Projeto React Native

Organização recomendada para manter a separação limpa de responsabilidades e escalabilidade:

```
mobile/
├── assets/                    # Imagens locais, ícones, logos, fontes (ex: Outfit)
├── src/
│   ├── config/                # firebase.js (Inicialização do Firestore & Auth)
│   ├── constants/             # theme.js (Cores claras/escuras, tamanhos, espaçamentos)
│   ├── context/               # AuthContext.jsx (Context API para guardar sessão do usuário)
│   ├── navigation/            # AppNavigator.jsx (Bottom Tabs & Native Stack Navigation)
│   ├── services/              # state.js, notifications.js, sessions.js, api.js
│   ├── utils/                 # utils.js (parseCurrencyInput, formatCurrency, formatDate)
│   ├── components/            # Componentes reutilizáveis
│   │   ├── CustomHeader.jsx   # Cabeçalho da página com logo e avatar
│   │   ├── TransactionItem.jsx# Item da lista de transação com badges
│   │   ├── BankCard.jsx       # Card da conta bancária
│   │   ├── CreditCardVisual.jsx# Cartão de crédito expansível
│   │   ├── GoalCard.jsx       # Card da meta financeira com barra de progresso
│   │   ├── MultiSelectDropdown.jsx # Seletor múltiplo de bancos/cartões
│   │   └── ModalForm.jsx      # Invólucro nativo para modais de edição
│   └── screens/               # Telas principais do aplicativo
│       ├── AuthScreen.jsx           # Login e Cadastro com Firebase Auth
│       ├── DashboardScreen.jsx      # Visão Geral (Resumo de Saldo e Últimas Transações)
│       ├── TransacoesScreen.jsx     # Histórico Completo com Paginação (25 itens)
│       ├── BancosScreen.jsx         # Contas Bancárias e Extrato Inline
│       ├── CartoesScreen.jsx        # Cartões de Crédito e Faturas Mensais
│       ├── MetasScreen.jsx          # Metas Financeiras e Aportes
│       ├── CategoriasScreen.jsx     # Categorias Personalizadas e Seletor de Ícones
│       ├── FixasScreen.jsx          # Transações Fixas Recorrentes
│       ├── InvestimentosScreen.jsx  # Investimentos, Aportes e Saldo Manual
│       ├── RelatoriosScreen.jsx     # Relatórios e Gráficos Financeiros
│       └── ConfiguracoesScreen.jsx  # Gerenciamento de Perfil, Foto e Suporte
├── App.jsx                    # Ponto de entrada (Entrypoint)
├── package.json
└── metro.config.js
```

### Onde colocar a lógica existente do site:
- **`src/firebase.js` da Web** → `mobile/src/config/firebase.js` (mantendo compatibilidade Firestore/Auth).
- **`src/utils.js` da Web** → `mobile/src/utils/utils.js` (substituindo chamadas de DOM por funções puras).
- **`src/state.js` da Web** → `mobile/src/services/state.js` ou Context API (`AuthContext.jsx`).
- **`src/views/*/*.js` da Web** → Convertidos nos arquivos correspondentes dentro de `mobile/src/screens/*.jsx`.

---

## 2. 🔄 Mapeamento HTML/CSS/JS → React Native

| Elemento Web (HTML/CSS) | Equivalente React Native | Observações & Exemplo |
| :--- | :--- | :--- |
| `<div>`, `<section>`, `<header>` | `<View>` | Containers de layout flexbox. `flexDirection` no React Native padrão é `'column'`. |
| `<p>`, `<span>`, `<h1>` ... `<h6>` | `<Text>` | **Todo texto** deve obrigatoriamente estar envelopado em `<Text>`. |
| `<button>`, `<a href="...">` | `<TouchableOpacity>` | Componente clicável com feedback de opacidade e propriedade `onPress`. |
| `<input type="text">`, `<textarea>` | `<TextInput>` | Usar `value={text}` e `onChangeText={setText}`. |
| `<select>`, `<option>` | `<Picker>` ou `Modal` customizado | Usar `@react-native-picker/picker` ou modal nativo com `<TouchableOpacity>`. |
| `styles.css` / classes CSS | `StyleSheet.create({ ... })` | Nomes de propriedades usam camelCase (`backgroundColor`, `borderRadius`). |
| `display: flex; gap: 12px;` | `flexDirection: 'row'`, `gap: 12` | React Native suporta `gap` nativamente em versões modernas. |
| `overflow-y: auto` / Scroll | `<ScrollView>` ou `<FlatList>` | Para listas com muitos elementos, sempre utilizar `<FlatList>`. |
| `window.confirm("...")` | `Alert.alert("Título", "Mensagem", [...])` | Caixa de diálogo nativa do sistema iOS/Android. |

---

## 3. ⚙️ Como Adaptar Cada Funcionalidade

### Navegação (React Navigation)
O sistema SPA por troca de IDs (`page-dashboard`, `page-transacoes`) é substituído por **React Navigation**:
- **Bottom Tabs Navigator**: Abas no rodapé para alternar entre *Visão Geral*, *Transações*, *Cartões*, *Investimentos*.
- **Native Stack Navigator**: Transições de pilha entre telas de detalhe e configurações.

### Estado Global e Armazenamento Local
- Substituir `localStorage.getItem()` / `setItem()` por `@react-native-async-storage/async-storage`:
  ```javascript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  // Salvar
  await AsyncStorage.setItem('contaComigo_theme', 'dark');
  // Ler
  const theme = await AsyncStorage.getItem('contaComigo_theme');
  ```

### Requisições HTTP
- A API BrasilAPI (`https://brasilapi.com.br/api/taxas/v1`) pode continuar usando `fetch()` nativo do React Native ou a biblioteca `axios`:
  ```javascript
  import axios from 'axios';
  const response = await axios.get('https://brasilapi.com.br/api/taxas/v1');
  ```

### Listagens de Alta Performance (`FlatList`)
Ao invés de concatenar HTML via `innerHTML += ...`, usar `<FlatList>`:
```javascript
<FlatList
  data={paginatedTransactions}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <TransactionItem item={item} />}
/>
```

---

## 4. 🚀 Configurações Iniciais e Dependências

### Dependências Fundamentais
Instalar via Expo CLI / npm:
```bash
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler @react-native-async-storage/async-storage axios firebase
```

### Variáveis de Ambiente
Criar um arquivo `.env` na raiz do app React Native e instalar `react-native-dotenv`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=conta-comigo-pro
```
No código, acessar via `process.env.EXPO_PUBLIC_FIREBASE_API_KEY`.

### CORS (Cross-Origin Resource Sharing)
No aplicativo mobile React Native, **não existem restrições de CORS do navegador**, pois as chamadas de rede são feitas diretamente pela camada nativa de rede do Android/iOS.

---

## 5. 🎨 Adaptações Específicas (Imagens, Fontes e Animações)

### Imagens
- **Remotas**: Usar `<Image source={{ uri: avatarUrl }} style={styles.avatar} />` (é obrigatório passar `width` e `height` no `style`).
- **Locais**: Usar `<Image source={require('../assets/logo.png')} />`.

### Fontes Personalizadas (Google Font Outfit)
Baixar os arquivos `.ttf` da fonte Outfit para `assets/fonts/` e carregar no `App.jsx`:
```javascript
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';

export default function App() {
  let [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  if (!fontsLoaded) return null;
  return <AppNavigator />;
}
```

---

## 6. 🏪 Publicação nas Lojas (Android & iOS)

### Gerar APK / AAB para Android
1. Instalar o CLI do EAS (Expo Application Services):
   ```bash
   npm install -g eas-cli
   ```
2. Realizar login e configurar o projeto:
   ```bash
   eas login
   eas build:configure
   ```
3. Gerar o arquivo APK para testes ou AAB para a Google Play Store:
   ```bash
   eas build --platform android --profile preview
   ```

### Gerar IPA para iOS (Requer Conta Apple Developer)
- É possível utilizar a nuvem do **EAS Build** da Expo para compilar o IPA sem ter um Mac físico local.
- Executar o comando:
   ```bash
   eas build --platform ios --profile production
   ```

### Permissões em `AndroidManifest.xml` e `Info.plist`
No Expo, as permissões de Notificações Push e Acesso à Galeria de Fotos (para alterar a foto de perfil) são configuradas diretamente no `app.json`:
```json
{
  "expo": {
    "name": "ContaComigoPro",
    "slug": "conta-comigo-pro",
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "O aplicativo precisa de acesso à galeria para alterar a foto de perfil."
        }
      ]
    ]
  }
}
```

---

## 7. 🧪 Testes e Depuração

### Dispositivo Físico (Android / iOS)
1. Instalar o aplicativo **Expo Go** na Google Play Store ou App Store.
2. Executar no terminal:
   ```bash
   npx expo start
   ```
3. Escanear o código QR impresso no terminal com a câmera do celular (iOS) ou pelo app Expo Go (Android).

### Emulador Android (Android Studio)
1. Abrir o **Android Studio** → *Virtual Device Manager* → Iniciar dispositivo virtual (AVD).
2. Teclar `a` no terminal onde o `npx expo start` está rodando.

### Emulador iOS (Xcode - macOS)
1. Abrir o Xcode → *Open Developer Tool* → *Simulator*.
2. Teclar `i` no terminal do Expo.

---

## ✅ Conclusão
O projeto mobile inicial foi criado com sucesso dentro da pasta `mobile/` contendo a arquitetura moderna, telas responsivas com paginação, cores do tema original e integração pronta para uso!
