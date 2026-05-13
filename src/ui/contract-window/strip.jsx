export function ContractWindowStrip({ summary = {} }) {
  const status = summary.functional_status || summary.status || 'unverified';
  return {
    component: 'ContractWindowStrip',
    contract_id: summary.contract_id || 'UNKNOWN',
    status,
    label: `${summary.contract_id || 'UNKNOWN'} · ${status}`,
  };
}

export default ContractWindowStrip;
