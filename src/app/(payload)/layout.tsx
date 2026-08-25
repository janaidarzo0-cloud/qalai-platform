/* THIS FILE FOLLOWS THE PAYLOAD-GENERATED ROUTE CONTRACT. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ReactNode } from 'react'

import { importMap } from './admin/importMap.js'
import './custom.css'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const PayloadLayout = ({ children }: { children: ReactNode }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default PayloadLayout
