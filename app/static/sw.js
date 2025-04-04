self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('Network error');
        })
    );
});
