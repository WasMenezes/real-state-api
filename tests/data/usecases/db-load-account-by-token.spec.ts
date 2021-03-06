import { Decrypter } from '../protocols/criptography'
import { LoadAccountByTokenRepository } from '../protocols/db/account/load-account-by-token-repository'
import { DbLoadAccountByToken } from '@/data/usecases/db-load-account-by-token'

const makeDecrypterStub = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (): Promise<string> {
      return new Promise(resolve => resolve('descrypted_value'))
    }
  }

  return new DecrypterStub()
}

const makeLoadAccountByTokenRepositoryStub = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositorStub implements LoadAccountByTokenRepository {
    async loadByToken (): Promise<LoadAccountByTokenRepository.Result> {
      return new Promise(resolve => resolve({ id: 'any_id' }))
    }
  }
  return new LoadAccountByTokenRepositorStub()
}

const makeSut = (): SutTypes => {
  const decrypterStub = makeDecrypterStub()
  const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepositoryStub()
  const sut = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepositoryStub)
  return {
    sut,
    decrypterStub,
    loadAccountByTokenRepositoryStub
  }
}

interface SutTypes {
  sut: DbLoadAccountByToken
  decrypterStub: Decrypter
  loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
}

describe('DbLoadAccountByToken Usecase', () => {
  describe('decrypter', () => {
    test('should call decrypter with correct values', async () => {
      const { sut, decrypterStub } = makeSut()
      const decrypterSpy = jest.spyOn(decrypterStub, 'decrypt')
      await sut.load('any_access_token')
      expect(decrypterSpy).toHaveBeenCalledWith('any_access_token')
    })

    test('should return null if decrypter throws', async () => {
      const { sut, decrypterStub } = makeSut()
      jest.spyOn(decrypterStub, 'decrypt').mockImplementation(() => {
        throw new Error()
      })
      const httpResponse = await sut.load('any_access_token')
      expect(httpResponse).toBeFalsy()
    })
  })

  describe('loadAccountByTokenRepository', () => {
    test('should call loadAccountByTokenRepository with correct values', async () => {
      const { sut, loadAccountByTokenRepositoryStub } = makeSut()
      const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
      await sut.load('any_token', 'any_role')
      expect(loadByTokenSpy).toHaveBeenCalledWith('any_token', 'any_role')
    })

    test('should return null if loadAccountByTokenRepository throws', async () => {
      const { sut, loadAccountByTokenRepositoryStub } = makeSut()
      jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockImplementation(async () => {
        throw new Error()
      })
      const httpResponse = await sut.load('any_access_token')
      expect(httpResponse).toBeFalsy()
    })
  })

  test('should return an account if succeeeds', async () => {
    const { sut } = makeSut()
    const httpReponse = await sut.load('any_token', 'any_role')
    expect(httpReponse).toEqual({ id: 'any_id' })
  })
})
