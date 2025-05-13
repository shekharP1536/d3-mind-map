export default {
  nodes: [
    {
      id: "root",
      text: "Mind Map",
      fx: 400,
      fy: 300
    },
    {
      id: "node1",
      text: "Ideas",
      fx: 600,
      fy: 200
    },
    {
      id: "node2",
      text: "Tasks",
      fx: 200,
      fy: 400
    }
  ],
  connections: [
    {
      source: "root",
      target: "node1"
    },
    {
      source: "root",
      target: "node2"
    }
  ]
};