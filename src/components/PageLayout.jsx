import { AppFooter } from './AppFooter.jsx';
import { SiteHeader } from './SiteHeader.jsx';

export default function PageLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <AppFooter />
    </>
  );
}
