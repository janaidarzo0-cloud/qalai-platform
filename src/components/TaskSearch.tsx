'use client'

import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'

export const TaskSearch = () => {
  const [message, setMessage] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const query = String(data.get('query') ?? '').trim()
    if (!query) return

    const queryLengthBucket = query.length <= 20 ? '1-20' : query.length <= 50 ? '21-50' : '51+'
    trackEvent({ name: 'search_submitted', queryLengthBucket })
    setMessage('Іздеу модулі келесі кезеңде CMS-тегі тексерілген сценарийлерге қосылады.')
  }

  return (
    <form className="task-search" onSubmit={submit}>
      <label className="sr-only" htmlFor="task-query">
        Сұрағыңызды жазыңыз
      </label>
      <div className="task-search__row">
        <input
          autoComplete="off"
          id="task-query"
          name="query"
          placeholder="Мысалы: декреттік төлемді қалай есептеймін?"
          type="search"
        />
        <button className="button" type="submit">
          Табу
        </button>
      </div>
      {message ? <p className="task-search__message">{message}</p> : null}
    </form>
  )
}
