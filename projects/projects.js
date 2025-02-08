import { fetchJSON, renderProjects } from '../global.js';

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title')

titleElement.textContent = `${projects.length} Projects`;
renderProjects(projects, projectsContainer, 'h2');
// console.log(projectsContainer.innerHTML);


// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
//   });


// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// let data = [1, 2];

// let total = 0;

// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }


// let data = [
//     { value: 1, label: 'apples' },
//     { value: 2, label: 'oranges' },
//     { value: 3, label: 'mangos' },
//     { value: 4, label: 'pears' },
//     { value: 5, label: 'limes' },
//     { value: 5, label: 'cherries' },
//   ];

let selectedIndex = -1;
let selectedYear = null;
let query = '';

// Helper function which encapsulates logic of filtering by both year and search query
function filterProjects(projects) {
    return projects.filter(project => {
      const matchesYear = selectedYear === null || project.year == selectedYear;
      const matchesSearch = query === '' || 
        Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase());
      return matchesYear && matchesSearch;
    });
  }


function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
      projectsGiven, 
      (v) => v.length,
      (d) => d.year
    );
  
    let data = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value); 
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();
    arcs.forEach((arc, idx) => {
        d3.select('svg')
          .append('path')
          .attr('d', arc)
          .attr('fill', colors(idx))
          .on('click', () => {
            selectedIndex = selectedIndex === idx ? -1 : idx;
            selectedYear = selectedIndex === -1 ? null : data[selectedIndex].label;
            
            d3.select('svg')
              .selectAll('path')
              .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');
              
            d3.select('.legend')
              .selectAll('li')
              .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');


            // Logic only filters projects based on selected year
            // if (selectedIndex === -1) {
            // renderProjects(projects, projectsContainer, 'h2'); 
            // } else {
            // const selectedYear = data[selectedIndex].label;
            // const filteredProjects = projects.filter(project => project.year == selectedYear);
            // renderProjects(filteredProjects, projectsContainer, 'h2');
            // }

            let filteredProjects = filterProjects(projects);
            renderProjects(filteredProjects, projectsContainer, 'h2');
        
          });
      });
    
      let legend = d3.select('.legend');
      data.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', idx === selectedIndex ? 'selected' : '')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
      });
    }
  
  renderPieChart(projects);
  
  let searchInput = document.querySelector('.searchBar');
  
  searchInput.addEventListener('change', (event) => {
    query = event.target.value;
    
    // Logic only filters projects based on search query
    // let filteredProjects = projects.filter((project) => {
    //   let values = Object.values(project).join('\n').toLowerCase();
    //   return values.includes(query.toLowerCase());
    // });
    let filteredProjects = filterProjects(projects);

  
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });



