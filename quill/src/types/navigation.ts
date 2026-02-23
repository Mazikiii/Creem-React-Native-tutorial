import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Home: undefined
  Editor: { documentId: string }
  Paywall: undefined
  Checkout: { checkoutUrl: string }
  Success: {
    checkoutId: string
    orderId: string | null
    customerId: string | null
    subscriptionId: string | null
    productId: string
    requestId: string | null
    signature: string
  }
}

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>
export type EditorScreenProps = NativeStackScreenProps<RootStackParamList, 'Editor'>
export type PaywallScreenProps = NativeStackScreenProps<RootStackParamList, 'Paywall'>
export type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>
export type SuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'Success'>
