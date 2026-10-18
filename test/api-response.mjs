import test from "node:test";
import assert from "node:assert/strict";
import { parseApiResponse } from "../dist/api-response.js";

function response(body, {status=200, contentType="application/json", url="https://api-krs.ms.gov.pl/api/krs/test"}={}) {
  // Response.url for mocked Response defaults to '' — error must handle that.
  const res = new Response(body, {status, headers: {"content-type": contentType}});
  Object.defineProperty(res, "url", {value:url});
  return res;
}

test("200 official JSON extract is parsed", async () => {
  const data=await parseApiResponse(response('{"odpis":{"rodzaj":"Aktualny"}}'));
  assert.equal(data.odpis.rodzaj,"Aktualny");
});
test("official JSON 404 is a confirmed miss", async () => {
  assert.equal(await parseApiResponse(response('{"message":"Not found"}',{status:404})),null);
});
test("HTML 200 challenge is upstream error, not JSON syntax error", async () => {
  await assert.rejects(() => parseApiResponse(response("<html>challenge</html>",{contentType:"text/html"})), /non-JSON.*HTTP 200.*text\/html/);
});
test("HTML 404 proxy error must not be reported as no KRS entry", async () => {
  await assert.rejects(() => parseApiResponse(response("<html>not found</html>",{status:404,contentType:"text/html"})), /HTTP 404.*text\/html/);
});
test("5xx and malformed JSON remain upstream failures", async () => {
  await assert.rejects(() => parseApiResponse(response("{}",{status:503})), /HTTP 503/);
  await assert.rejects(() => parseApiResponse(response("not-json")), /invalid JSON/);
});
test("response body never appears in error diagnostics", async () => {
  await assert.rejects(() => parseApiResponse(response("<html>SECRET_SNIPPET</html>",{contentType:"text/html"})), (err) => !err.message.includes("SECRET_SNIPPET"));
});
