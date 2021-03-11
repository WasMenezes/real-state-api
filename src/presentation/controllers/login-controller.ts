import { MissingParamError } from '@/presentation/errors/missing-param-error'
import { badRequest, serverError } from '@/presentation/helpers/http-helper'
import { HttpResponse, HttpRequest } from '@/presentation/protocols/http'
import { Controller } from '@/presentation/protocols/controller'
import { InvalidParamError } from '../errors/invalid-param-error'

export class LoginController implements Controller {
  constructor (
    private readonly emailValidator: any
  ) { }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      if (!httpRequest.body.email) {
        return badRequest(new MissingParamError('email'))
      }

      if (!httpRequest.body.password) {
        return badRequest(new MissingParamError('password'))
      }

      const requiredFields = ['email', 'password']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const isValid = this.emailValidator.isValid(httpRequest.body.email)
      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }
    } catch (error) {
      return serverError()
    }
  }
}
