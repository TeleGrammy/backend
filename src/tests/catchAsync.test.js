/* eslint-disable node/no-unpublished-require */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
const {expect} = require("chai");
const sinon = require("sinon");

const catchAsync = require("../utils/catchAsync");

describe("catchAsync Utility Function", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {};
    next = sinon.spy();
  });

  it("should call the async function and invoke next if no error occurs", async () => {
    const asyncFunction = sinon.stub().resolves();
    const wrappedFunction = catchAsync(asyncFunction);

    await wrappedFunction(req, res, next);

    expect(asyncFunction.calledOnce).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should catch errors and call next with the error", async () => {
    const error = new Error("Test error");
    const asyncFunction = sinon.stub().rejects(error);
    const wrappedFunction = catchAsync(asyncFunction);

    await wrappedFunction(req, res, next);

    expect(asyncFunction.calledOnce).to.be.true;
    expect(next.calledOnce).to.be.true;
    expect(next.calledWith(error)).to.be.true;
  });
});
