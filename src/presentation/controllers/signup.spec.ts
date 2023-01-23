import { SignUpController } from "./signup";
import { MissingParamError } from "../errors/missing-param-error";
import { InvalidParamError } from "../errors/invalid-param-error";
import { EmailValidator } from "../protocols/email-validator";
import { ServerError } from "../protocols/ServerError";
import { AddAccount,AddAccountModel } from "../../domain/usecases/add-account";
import { AccountModel } from "../../domain/usecases/models/account";

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub : AddAccount
}

class EmailValidatorStub implements EmailValidator {
  isValid(email: string): boolean {
    return true;
  }
}

class makeAddAccount implements AddAccount {
  add(account: AddAccountModel): AccountModel {
    const fakeAccount = {
      id: 'valid_id',
      name: "any_name",
      email: "any@hotmail.com",
      password: "any_password",
    }
    return fakeAccount;
  }
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = new EmailValidatorStub();
  const addAccountStub = new makeAddAccount()

  const sut = new SignUpController(emailValidatorStub,addAccountStub);
  return {
    sut,
    emailValidatorStub,
    addAccountStub
  };
};

describe("SignUp Controller", () => {
  test("Should return 400 if no name is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        // name: 'any_name',
        email: "any_email@hotmail.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });
  test("Should return 400 if no email is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        // email: 'any_email@hotmail.com',
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });
  test("Should return 400 if no password is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@hotmail.com",
        //password: 'any_password',
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });
  test("Should return 400 if no passwordConfirmation is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@hotmail.com",
        password: "any_password",
        //passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new MissingParamError("passwordConfirmation")
    );
  });

  test("Should return 400 if passwordConfirmation is falied", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@hotmail.com",
        password: "any_password",
        passwordConfirmation: "invalid_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'));
  });
  test("Should return 400 if an invalid email is provided", () => {
    const { sut, emailValidatorStub } = makeSut();
    //jest alterando o valor do return isvalid de true pra false
    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: "any_name",
        email: "invalid_email@hotmail.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });

  test("Should calll EmailValidator with correct email", () => {
    const { sut, emailValidatorStub } = makeSut();
    //jest alterando o valor do return isvalid de true pra false
    const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");

    const httpRequest = {
      body: {
        name: "any_name",
        email: "any@hotmail.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith("any@hotmail.com");
  });

  test("Should return 500 if emailValidator throws", () => {
    const { sut,emailValidatorStub } = makeSut();

    //Basicamente vai sobreescrever o retorno do metodo isvalid
    jest.spyOn(emailValidatorStub,'isValid').mockImplementationOnce( () => {
      throw new Error()
    })
    
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any@hotmail.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should calll EmailValidator with correct email", () => {
    const { sut,addAccountStub } = makeSut();
    //jest alterando o valor do return isvalid de true pra false
    const addSpy = jest.spyOn(addAccountStub, "add");

    const httpRequest = {
      body: {
        name: "any_name",
        email: "any@hotmail.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    sut.handle(httpRequest);
    expect(addSpy).toHaveBeenCalledWith({
      name: "any_name",
      email: "any@hotmail.com",
      password: "any_password",
    });
  });
});
