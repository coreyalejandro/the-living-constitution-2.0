export function HaltMatrix({ halts = [] }) {
  return {
    component: 'HaltMatrix',
    active: halts.filter((halt) => halt.status === 'active'),
    all: halts,
  };
}

export default HaltMatrix;
