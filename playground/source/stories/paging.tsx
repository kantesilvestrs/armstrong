import { storiesOfHook } from "../story-host";
import * as React from 'react'
import { useInfinitePaging, usePaging, utils, calendarUtils, Repeater } from '../_symlink';

// const date = calendarUtils.date.parse("1920-11-12", calendarUtils.date.formats.wireDate)
// date.isValid()
// const formatted = calendarUtils.date.format(date, calendarUtils.date.formats.wireDate)
function wait(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  })
}
let throwError = false
async function loadInfinitePage(page: number) {
  await wait(1000)
  if (page === 2) {
    throwError = !throwError
  }

  if (throwError) {
    //throwError = !throwError
    throw new Error("ARGHHH!")
  }

  return {
    data: ["a-" + page, "b-" + page, "c-" + page],
    nextPageToken: page === 4 ? 0 : page + 1,
    total: 12
  }
}

async function loadPage(page: number, pageSize: number) {
  const pages = [pageSize, pageSize, pageSize - 1]
  await wait(1000)
  if (page === 2) {
    throwError = !throwError
  }

  if (throwError) {
    //throwError = !throwError
    throw new Error("ARGHHH!")
  }

  return {
    data: utils.array.range(1, pages[page - 1] + 1).map(i => i + "-" + page),
    totalRecords: utils.array.reduce(pages, (m, t) => m + t, 0)
  }
}

function Is(props: { message: string, is: boolean }) {
  return <div>{`${props.message}: ${props.is ? "Y" : "N"}`}</div>
}

storiesOfHook("usePaging")
  .add("Basic", () => {
    const { items, isFetching, hasData, fetchError, gotoPage, totalRecords, totalPages, currentPage, reload } = usePaging<string>({ fetch: loadPage, pageSize: 10 })
    return (
      <>
        <Is message="FETCHING" is={isFetching} />
        <Is message="DATA" is={hasData} />
        <Is message="ERROR" is={!!fetchError} />

        <button onClick={reload}>RELOAD</button>
        <hr />
        {fetchError && <button onClick={() => gotoPage(currentPage)}>Error! Retry</button>}
        <ul>
          {items.map(i => <li key={i}>{i}</li>)}
        </ul>
        <hr />
        {totalPages && <Repeater count={totalPages} render={p => <button disabled={p.index === currentPage} onClick={() => gotoPage(p.index)}>{p.index}</button>} />}
        <div>{`Records: ${totalRecords}  Pages: ${totalPages}`}</div>
        <div>{!hasData && isFetching ? "LOADING" : ""}</div>
        <div>{hasData && isFetching ? "LOADING MORE" : ""}</div>
      </>
    )
  })

storiesOfHook("useInfinitePaging")
  .add("Basic", () => {
    const { items, isFetching, hasData, hasFinished, fetchError, loadMore, reload } = useInfinitePaging<string>({ fetch: loadInfinitePage, firstPageToken: 1 })
    return (
      <>
        <Is message="FINISHED" is={hasFinished} />
        <Is message="FETCHING" is={isFetching} />
        <Is message="DATA" is={hasData} />
        <Is message="ERROR" is={!!fetchError} />
        <button onClick={loadMore} disabled={hasFinished}>LOAD MORE</button>
        <button onClick={reload}>RELOAD</button>
        <hr />
        <ul>
          {items.map(i => <li key={i}>{i}</li>)}
        </ul>
        <hr />
        <div>{!hasData && isFetching ? "LOADING" : ""}</div>
        <div>{hasData && isFetching ? "LOADING MORE" : ""}</div>
      </>
    )
  })