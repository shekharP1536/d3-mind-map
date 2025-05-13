import * as d3 from 'd3';

export class MindMap {
  private svg: SVGSVGElement;
  private data: any;

  constructor(svg: SVGSVGElement, data: any) {
    this.svg = svg;
    this.data = data;
  }

  renderMap() {
    // Basic D3 mind map implementation
    const width = this.svg.clientWidth || 800;
    const height = this.svg.clientHeight || 600;

    const svg = d3.select(this.svg)
      .attr('width', width)
      .attr('height', height);

    // Clear any existing content
    svg.selectAll('*').remove();

    // Create a group element for the mind map
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Initialize the tree layout
    const tree = d3.tree()
      .size([360, Math.min(width, height) / 2 - 90])
      .separation((a: any, b: any) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Create the root node
    const root = d3.hierarchy(this.data);
    
    const links = g.selectAll('.link')
      .data(tree(root).links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkRadial()
        .angle((d: any) => d.x / 180 * Math.PI)
        .radius((d: any) => d.y));

    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => 
        `rotate(${d.x - 90}) translate(${d.y},0)`);

    nodes.append('circle')
      .attr('r', 4);

    nodes.append('text')
      .attr('dy', '.31em')
      .attr('x', (d: any) => d.x < 180 ? 8 : -8)
      .style('text-anchor', (d: any) => d.x < 180 ? 'start' : 'end')
      .attr('transform', (d: any) => d.x < 180 ? null : 'rotate(180)')
      .text((d: any) => d.data.name);
  }
}