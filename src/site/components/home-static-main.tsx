import { HomeHero, HomeLaunchProvider, HomeProductsLaunch } from './home-hero';

export type HomeStaticMarkup = {
  welcomeRest: string;
  newsAndResearch: string;
  products: string;
  casesAndCompany: string;
};

export const HomeStaticMain = ({ markup, initialReleased }: { markup: HomeStaticMarkup; initialReleased: boolean }) => (
  <HomeLaunchProvider initialReleased={initialReleased}>
    <section className="home-welcome">
      <div className="home-welcome-inner">
        <HomeHero />
        <div className="home-static-fragment" dangerouslySetInnerHTML={{ __html: markup.welcomeRest }} />
      </div>
    </section>
    <div className="home-static-fragment" dangerouslySetInnerHTML={{ __html: markup.newsAndResearch }} />
    <HomeProductsLaunch>
      <div className="home-static-fragment" dangerouslySetInnerHTML={{ __html: markup.products }} />
    </HomeProductsLaunch>
    <div className="home-static-fragment" dangerouslySetInnerHTML={{ __html: markup.casesAndCompany }} />
  </HomeLaunchProvider>
);
