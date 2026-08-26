'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'
import {
  getQueryLengthBucket,
  getResultCountBucket,
  getSearchResultPositionBucket,
  searchTasks,
  type SearchTask,
} from '@/lib/search/tasks'

type Props = {
  tasks: readonly SearchTask[]
}

export const TaskSearch = ({ tasks }: Props) => {
  const [results, setResults] = useState<SearchTask[] | null>(null)
  const [searchContext, setSearchContext] = useState<{
    queryLengthBucket: ReturnType<typeof getQueryLengthBucket>
    resultCountBucket: Exclude<ReturnType<typeof getResultCountBucket>, '0'>
  } | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const query = String(data.get('query') ?? '').trim()
    if (!query) return

    const nextResults = searchTasks(tasks, query)
    const queryLengthBucket = getQueryLengthBucket(query)
    const resultCountBucket = getResultCountBucket(nextResults.length)
    trackEvent({
      name: 'search_submitted',
      queryLengthBucket,
      resultCountBucket,
    })
    setSearchContext(resultCountBucket === '0' ? null : { queryLengthBucket, resultCountBucket })
    setResults(nextResults)
  }

  return (
    <form className="task-search" onSubmit={submit}>
      <label className="sr-only" htmlFor="task-query">
        Сұрағыңызды жазыңыз
      </label>
      <div className="task-search__row">
        <input
          autoComplete="off"
          aria-describedby="task-search-status"
          id="task-query"
          maxLength={120}
          name="query"
          placeholder="Мысалы: автонесие ай сайынғы төлем"
          type="search"
        />
        <button className="button" type="submit">
          Нұсқаулықты табу
        </button>
      </div>
      <p className="task-search__message" id="task-search-status" role="status">
        {results === null
          ? 'Сұрау мәтіні құрылғыңызда ғана өңделеді.'
          : results.length > 0
            ? `${results.length} тексерілген материал табылды.`
            : 'Сәйкес жарияланған әрі тексерілген материал табылмады. Сұрауды қысқартып көріңіз.'}
      </p>
      {results && results.length > 0 ? (
        <nav aria-label="Іздеу нәтижелері" className="task-search__results">
          {results.map((task, index) => (
            <Link
              href={task.href}
              key={task.href}
              onClick={() => {
                if (!searchContext) return
                trackEvent({
                  name: 'search_result_click',
                  positionBucket: getSearchResultPositionBucket(index + 1),
                  ...searchContext,
                  task: task.task,
                })
              }}
            >
              <span className="task-search__result-meta">{task.meta}</span>
              <strong>{task.title}</strong>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </form>
  )
}
