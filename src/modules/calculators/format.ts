const kztFormatter = new Intl.NumberFormat('kk-KZ', {
  maximumFractionDigits: 0,
})

export const formatKzt = (value: number) => `${kztFormatter.format(value)}\u00a0₸`
