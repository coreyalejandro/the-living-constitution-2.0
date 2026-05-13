export function KanbanBoard({ acceptanceCriteria = [] }) {
  const columns = { unverified: [], verified: [], blocked: [], waived: [] };
  for (const criterion of acceptanceCriteria) {
    const status = criterion.status || 'unverified';
    if (!columns[status]) columns[status] = [];
    columns[status].push(criterion);
  }
  return { component: 'KanbanBoard', columns };
}

export default KanbanBoard;
