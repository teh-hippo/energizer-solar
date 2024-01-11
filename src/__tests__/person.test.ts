import { expect } from 'chai'
import * as sig from '../signature'

describe('Person', () => {
  beforeEach(sig.init)
  afterEach(sig.close)
  it('can calculate a signature', async () => {
    const uriPath = '/c/v0/user/login'
    const token = ''
    const timestamp = 1704924640451
    const actual = await sig.calculateSignature(uriPath, token, timestamp)
    expect(actual).to.equal('4c615f3877ea8f890fd4eb185e8a6b88.5245784')
  })
})
