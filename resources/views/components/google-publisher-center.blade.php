@if (config('services.google_publisher_center.enabled') && config('services.google_publisher_center.product_id'))
    <script async type="application/javascript" src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
    <script>
        (() => {
            const productId = @json(config('services.google_publisher_center.product_id'));
            const language = @json(config('services.google_publisher_center.language', 'id'));
            const key = `${productId}:${language}`;

            self.__RADINA_SWG_BASIC_INITIALIZED__ = self.__RADINA_SWG_BASIC_INITIALIZED__ || {};

            if (self.__RADINA_SWG_BASIC_INITIALIZED__[key]) {
                return;
            }

            self.__RADINA_SWG_BASIC_INITIALIZED__[key] = true;
            (self.SWG_BASIC = self.SWG_BASIC || []).push((basicSubscriptions) => {
                basicSubscriptions.init({
                    type: 'NewsArticle',
                    isPartOfType: ['Product'],
                    isPartOfProductId: productId,
                    clientOptions: { theme: 'light', lang: language },
                });
            });
        })();
    </script>
@endif
