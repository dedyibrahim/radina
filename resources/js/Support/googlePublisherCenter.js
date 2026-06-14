const scriptUrl = 'https://news.google.com/swg/js/v1/swg-basic.js';

export const initializeGooglePublisherCenter = ({ productId, language = 'id' } = {}) => {
    if (typeof window === 'undefined' || !productId) {
        return;
    }

    const key = `${productId}:${language}`;
    window.__RADINA_SWG_BASIC_INITIALIZED__ = window.__RADINA_SWG_BASIC_INITIALIZED__ || {};

    if (window.__RADINA_SWG_BASIC_INITIALIZED__[key]) {
        return;
    }

    window.__RADINA_SWG_BASIC_INITIALIZED__[key] = true;
    window.SWG_BASIC = window.SWG_BASIC || [];
    window.SWG_BASIC.push((basicSubscriptions) => {
        basicSubscriptions.init({
            type: 'NewsArticle',
            isPartOfType: ['Product'],
            isPartOfProductId: productId,
            clientOptions: { theme: 'light', lang: language },
        });
    });

    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.type = 'application/javascript';
        script.src = scriptUrl;
        document.head.appendChild(script);
    }
};
