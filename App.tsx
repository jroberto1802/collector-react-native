import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CollectionDetailView } from './src/views/CollectionDetailView';
import { HomeView } from './src/views/HomeView';
import { LoginView } from './src/views/LoginView';
import { ProductsView } from './src/views/ProductsView';
import { SettingsView } from './src/views/SettingsView';

type AuthenticatedRoute = 'home' | 'products' | 'collection' | 'settings';

export default function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isInitialSyncRequired, setInitialSyncRequired] = useState(false);
  const [route, setRoute] = useState<AuthenticatedRoute>('home');
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(
    null,
  );

  const handleLoginSuccess = () => {
    setRoute('home');
    setSelectedCollectionId(null);
    setInitialSyncRequired(true);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setRoute('home');
    setSelectedCollectionId(null);
    setInitialSyncRequired(false);
    setAuthenticated(false);
  };

  const openCollection = (collectionId: number) => {
    setSelectedCollectionId(collectionId);
    setRoute('collection');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isAuthenticated ? (
        route === 'products' ? (
          <ProductsView onBack={() => setRoute('home')} />
        ) : route === 'settings' ? (
          <SettingsView onBack={() => setRoute('home')} />
        ) : route === 'collection' && selectedCollectionId != null ? (
          <CollectionDetailView
            collectionId={selectedCollectionId}
            onBack={() => {
              setSelectedCollectionId(null);
              setRoute('home');
            }}
          />
        ) : (
          <HomeView
            initialSyncRequired={isInitialSyncRequired}
            onInitialSyncCompleted={() => setInitialSyncRequired(false)}
            onLogout={handleLogout}
            onOpenCollection={openCollection}
            onOpenProducts={() => setRoute('products')}
            onOpenSettings={() => setRoute('settings')}
          />
        )
      ) : (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}
