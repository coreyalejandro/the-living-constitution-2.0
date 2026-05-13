export function VntDetail({ vnt = null }) {
  return {
    component: 'VntDetail',
    what: vnt?.what || 'No V&T statement supplied.',
    true: vnt?.true || 'unverified',
    unverified: vnt?.unverified || 'unverified',
    functional_status: vnt?.functional_status || 'unverified',
  };
}

export default VntDetail;
