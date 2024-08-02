import DomainStoryIdFactory from "../modeler/domainStoryIdFactory";

describe("DomainStoryIdFactory", function () {
  it("generateId", function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId("shape");
    expect(res).not.toEqual("shape_0001");
  });

  it("generateId equal length", function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId("shape");
    const otherId = "shape_0001";
    expect(res.length).toEqual(otherId.length);
  });

  it("generateId short length 001", function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId("shape");
    const otherId = "shape_001";
    expect(res.length).not.toEqual(otherId.length);
  });

  it("generateId long length 00001", function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId("shape");
    const otherId = "shape_00001";
    expect(res.length).not.toEqual(otherId.length);
  });

  it("generateId unique iD amount 5k", function () {
    this.timeout(0);
    const idFactory = new DomainStoryIdFactory();
    const res = [];
    for (let i = 0; i < 5000; i++) {
      res[i] = idFactory.getId("");
    }

    for (let i = 0; i < res.length - 1; i++) {
      for (let j = i + 1; j < res.length; j++) {
        expect(res[i]).not.toEqual(res[j]);
      }
    }
  });
});
