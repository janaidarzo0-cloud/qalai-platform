/* THIS FILE FOLLOWS THE PAYLOAD-GENERATED ROUTE CONTRACT. */
import config from '@payload-config'
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import type { Metadata } from 'next'

import { importMap } from '../importMap'

type PageProps = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: PageProps): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const NotFound = ({ params, searchParams }: PageProps) =>
  NotFoundPage({ config, params, searchParams, importMap })

export default NotFound
