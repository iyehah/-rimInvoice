export interface PaymentMethod {
  id: string
  name: string
  nameAr: string
  nameFr: string
  logo: string
  isEnabled: boolean
  instructions?: string
  instructionsAr?: string
  instructionsFr?: string
  accountFormat?: string
  color?: string
}

export interface PaymentMethodsConfig {
  methods: PaymentMethod[]
  defaultCurrency: string
  currencySymbol: string
}
