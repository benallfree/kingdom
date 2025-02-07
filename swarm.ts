const json = async (res: Response) => {
  const text = await res.text()
  try {
    console.log('json try')
    const res = JSON.parse(text)
    console.log(`json ok`)
    return res
  } catch (e) {
    res.headers.forEach((v, k) => {
      console.error(`${k}: ${v}`)
    })
    console.error(text)
    return null
  }
}

const _fetch = (token?: string) => {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = token
  }
  const url = `https://kingdom.pockethost.io/api/login`
  console.log(`fetch ${url}`)
  return fetch(url, {
    headers,
  })
    .then((res) => {
      console.log(`fetch ok ${url}`)
      return res
    })
    .catch((e) => {
      console.error(`fetch error ${url}`)
      console.error(e)
      throw e
    })
}

async function main() {
  const res = await _fetch()
  const data = await json(res)
  if (!data?.user?.id) {
    throw new Error('failed to login')
  }

  const { token, user } = data
  while (true) {
    const res = await _fetch(token)
    const data = await json(res)
    if (!data) {
      throw new Error('failed to log in authenticated')
    }
    if (data.user?.id !== user.id) {
      console.log(data)
      throw new Error(`user ${user.id} changed to ${data.user.id}`)
    }
  }
}

for (let i = 0; i < 50; i++) {
  main()
}
