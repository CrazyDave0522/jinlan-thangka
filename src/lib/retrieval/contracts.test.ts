// @vitest-environment node
import { describe, expect, it } from "vitest";
import { normalizeQuery } from "./contracts";
const filter = { field: "name", value: "  度母  Tara %,_(*)'\\  ", mode: "contains" };
describe("strict archive query contract", () => {
  it("normalizes only identity case and outer whitespace", () => {
    expect(normalizeQuery({kind:"lookup",entity:"artist",id:"ABCDEF00-1234-1234-1234-123456789ABC"})).toMatchObject({id:"abcdef00-1234-1234-1234-123456789abc"});
    expect(normalizeQuery({kind:"search",entity:"artwork",filters:[filter]})).toMatchObject({limit:5,filters:[{...filter,value:filter.value.trim()}]});
  });
  it.each([
    null, {}, {kind:"browse",entity:"artist"}, {kind:"lookup",entity:"artist",id:"bad"},
    {kind:"lookup",entity:"image",id:"00000000-0000-0000-0000-000000000001"},
    ...[0,11,1.2,"5",null,NaN].map(limit=>({kind:"search",entity:"artwork",filters:[filter],limit})),
    ...[[],[filter,filter], [{...filter,field:"subject"}], [{...filter,value:" "}], [{...filter,value:"x\n"}], [{...filter,value:"\ud800"}], [{...filter,value:"😀".repeat(201)}], [{...filter,sql:"DROP"}]].map(filters=>({kind:"search",entity:"artist",filters})),
    {kind:"search",entity:"artist",filters:[filter],sql:"anything"},
  ])("rejects malformed input %j", input => { expect(()=>normalizeQuery(input)).toThrow("invalid_query"); });
  it.each(["name","style","subject","collection","accession"])("accepts artwork %s in both modes", field => {
    for (const mode of ["exact","contains"]) expect(normalizeQuery({kind:"search",entity:"artwork",filters:[{field,mode,value:"😀".repeat(200)}],limit:10})).toMatchObject({limit:10});
  });
});
