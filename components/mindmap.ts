import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';

interface MindMapNode {
  id: string;
  text: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  children?: MindMapNode[];
}

interface MindMapConnection {
  source: string;
  target: string;
}

interface MindMapData {
  nodes: MindMapNode[];
  connections: MindMapConnection[];
}

export class MindMap {
  private svg: SVGSVGElement;
  private data: MindMapData;
  private simulation: d3.Simulation<any, undefined>;
  private nodesSelection: d3.Selection<any, any, any, any>;
  private linksSelection: d3.Selection<any, any, any, any>;

  constructor(svg: SVGSVGElement, data: MindMapData) {
    this.svg = svg;
    this.data = data;
    this.initializeSimulation();
  }

  private initializeSimulation() {
    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(this.svg.clientWidth / 2, this.svg.clientHeight / 2))
      .force('collision', d3.forceCollide().radius(100));
  }

  private createNodeElement(node: MindMapNode) {
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '200');
    foreignObject.setAttribute('height', '100');

    const html = `
      <div xmlns="http://www.w3.org/1999/xhtml" class="node-body">
        <div class="options">
          <div class="option add-item"><i class="fas fa-plus-circle"></i></div>
          <div class="option edit-item"><i class="fas fa-pencil-alt"></i></div>
          <div class="option remove-item"><i class="fas fa-trash-alt"></i></div>
        </div>
        <a class="node-text">${node.text}</a>
      </div>
    `;

    foreignObject.innerHTML = html;
    return foreignObject;
  }

  private handleNodeClick = (event: Event, d: any) => {
    const target = event.target as HTMLElement;
    
    if (target.closest('.add-item')) {
      this.addNode(d);
    } else if (target.closest('.edit-item')) {
      this.editNode(d);
    } else if (target.closest('.remove-item')) {
      this.removeNode(d);
    }
  }

  private addNode(parentNode: MindMapNode) {
    const text = prompt('Enter node text:');
    if (text) {
      const newNode: MindMapNode = {
        id: uuidv4(),
        text,
        x: parentNode.x,
        y: parentNode.y ? parentNode.y + 100 : 0
      };

      this.data.nodes.push(newNode);
      this.data.connections.push({
        source: parentNode.id,
        target: newNode.id
      });

      this.renderMap();
    }
  }

  private editNode(node: MindMapNode) {
    const newText = prompt('Edit node text:', node.text);
    if (newText) {
      node.text = newText;
      this.renderMap();
    }
  }

  private removeNode(node: MindMapNode) {
    if (confirm('Are you sure you want to remove this node?')) {
      // Remove node and its connections
      this.data.nodes = this.data.nodes.filter(n => n.id !== node.id);
      this.data.connections = this.data.connections.filter(
        c => c.source !== node.id && c.target !== node.id
      );
      this.renderMap();
    }
  }

  private drag(simulation: d3.Simulation<any, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  renderMap() {
    const svg = d3.select(this.svg);
    svg.selectAll('*').remove();

    // Create the links
    this.linksSelection = svg.append('g')
      .selectAll('path')
      .data(this.data.connections)
      .enter()
      .append('path')
      .attr('class', 'mindmap-connection');

    // Create the nodes
    this.nodesSelection = svg.append('g')
      .selectAll('foreignObject')
      .data(this.data.nodes)
      .enter()
      .append('foreignObject')
      .attr('class', 'mindmap-node')
      .attr('width', 200)
      .attr('height', 100)
      .html(d => this.createNodeElement(d).innerHTML)
      .call(this.drag(this.simulation) as any);

    // Add click handlers
    this.nodesSelection.each((d, i, nodes) => {
      nodes[i].addEventListener('click', (e) => this.handleNodeClick(e, d));
    });

    // Update simulation
    this.simulation
      .nodes(this.data.nodes)
      .force('link', d3.forceLink(this.data.connections).id((d: any) => d.id).distance(150))
      .on('tick', () => {
        this.linksSelection
          .attr('d', (d: any) => {
            const sourceX = d.source.x;
            const sourceY = d.source.y;
            const targetX = d.target.x;
            const targetY = d.target.y;
            
            return `M${sourceX},${sourceY}C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`;
          });

        this.nodesSelection
          .attr('x', (d: any) => d.x - 100)
          .attr('y', (d: any) => d.y - 50);
      });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });

    svg.call(zoom as any);
  }
}