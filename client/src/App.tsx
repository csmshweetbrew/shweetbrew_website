import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { CatalogProvider } from "./contexts/CatalogContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";
import { OPEN_LEGAL_PAGES } from "./config/legal";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Legal = lazy(() => import("./pages/Legal"));

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {OPEN_LEGAL_PAGES.map((p) => (
        <Route key={p.path} path={p.path}>
          <Suspense fallback={<div className="min-h-screen" />}><Legal page={p} /></Suspense>
        </Route>
      ))}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <CatalogProvider>
            <CartProvider>
              <Navbar />
              <Router />
              <Footer />
            </CartProvider>
          </CatalogProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
