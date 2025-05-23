document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile');
    
    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const page = tile.getAttribute('data-page');
            window.location.href = page;
        });
    });
});