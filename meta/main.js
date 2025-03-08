let data = []

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    // processCommits();
    displayStats();
    console.log(commits);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  await createScatterplot();
});


let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
      });

      return ret;
    });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add number of files
  const fileCount = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(fileCount);

  // Add max lines per commit
  const maxLinesPerCommit = d3.max(commits, c => c.totalLines);
  dl.append('dt').text('Max lines');
  dl.append('dd').text(maxLinesPerCommit);

  // Add more stats as needed...
}


function createScatterplot() { 
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');

  dots
  .selectAll('circle')
  .data(commits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', 5)
  .attr('fill', 'steelblue')
  .on('mouseenter', (event, commit) => {
    updateTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on('mouseleave', () => {
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });
  

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  
  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id.substring(0, 7); // Show shortened commit hash
  
  // Format date nicely
  const dateFormatted = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
  date.textContent = dateFormatted;
  
  // You could add more information here as needed
  // Example: Add author, time, lines changed, etc.
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}