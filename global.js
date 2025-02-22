console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a")

// let currentLink = navLinks.find(
    //     (a) => a.host === location.host && a.pathname === location.pathname
    // )
    
    // currentLink?.classList.add('current');
    

    
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact'},
    { url: 'resume/', title: 'Resume'},
    { url: 'https://github.com/harisdsc', title: 'GitHub'}
];
    
const ARE_WE_HOME = document.documentElement.classList.contains('home');
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    } else if (p.title === 'GitHub') {
        url = url;
    } else if (ARE_WE_HOME && url.startsWith('http')) {
        url = '/portfolio/'
    }
    // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
      );
   if (a.host !== location.host) {
    a.target = "_blank"
    a.classList.remove("current")
   } 
  }

  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="automatic">Automatic</option>
          </select>
      </label>`
  );

let select = document.querySelector('select');

function setColorScheme(value) {
if (value === 'automatic') {
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.style.setProperty('color-scheme', systemPreference);
} else {
    document.documentElement.style.setProperty('color-scheme', value);
}
}

if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    setColorScheme(savedScheme);
    select.value = savedScheme;
} else {
    setColorScheme('automatic');
}

select.addEventListener('input', function (event) {
    const selectedValue = event.target.value;
    console.log('Color scheme changed to', selectedValue);
    setColorScheme(selectedValue);
    localStorage.colorScheme = selectedValue;
});

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        console.log(response);
        const data = await response.json();
        return data; 

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    for (const project of projects) {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <div>
                <p>${project.description}</p>
                <p>c. ${project.year}</p>
                <p><a href="${project.url}">View Project</a></p>
            </div>
        `;
        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}


if (1 === 1) {
    console.log('Math works!');
}