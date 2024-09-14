document.addEventListener("astro:page-load", () => {
    const search = document.getElementById('search');
    const container = document.getElementById('container');
    
    const allApps = container ? Array.from(container.children) : [];
  
    if (search) {
      search.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const query = target.value.toLowerCase();
        for (const card of allApps) {
          const span = card.querySelector('span');
          const name = span?.textContent ? span.textContent.toLowerCase() : '';
          (card as HTMLElement).style.display = name.includes(query) ? '' : 'none';
        }
      });
    }
  });