const test = require("node:test");
const assert = require("node:assert/strict");
const { promoteSuperadmin } = require("../scripts/promote-superadmin");

function setup({ existingSuperadmin = null, target = null } = {}) {
  const queries = [];
  let saveCount = 0;
  const UsuarioModel = {
    async exists(query) {
      queries.push(["exists", query]);
      return existingSuperadmin;
    },
    async findOne(query) {
      queries.push(["findOne", query]);
      return target;
    },
  };
  return { UsuarioModel, queries, get saveCount() { return saveCount; }, countSave() { saveCount += 1; } };
}

test("promotes an active admin when only inactive superadmins exist", async () => {
  const target = {
    email: "admin@example.com",
    rol: "admin",
    activo: true,
    tokenVersion: 3,
    async save() { fixture.countSave(); },
  };
  const fixture = setup({ target });

  await promoteSuperadmin({
    email: "admin@example.com",
    UsuarioModel: fixture.UsuarioModel,
    confirmPromotion: async () => "PROMOVER",
  });

  assert.deepEqual(fixture.queries, [
    ["exists", { rol: "superadmin", activo: true }],
    ["findOne", { email: "admin@example.com" }],
  ]);
  assert.equal(target.rol, "superadmin");
  assert.equal(target.tokenVersion, 4);
  assert.equal(fixture.saveCount, 1);
});

test("blocks promotion when an active superadmin exists", async () => {
  const fixture = setup({ existingSuperadmin: { _id: "other-user" } });
  await assert.rejects(
    promoteSuperadmin({ email: "admin@example.com", UsuarioModel: fixture.UsuarioModel, confirmPromotion: async () => "PROMOVER" }),
    /superadmin activo/
  );
  assert.deepEqual(fixture.queries, [["exists", { rol: "superadmin", activo: true }]]);
  assert.equal(fixture.saveCount, 0);
});

test("requires an existing active admin and PROMOVER, without saving on rejection", async (t) => {
  for (const target of [
    null,
    { rol: "admin", activo: false },
    { rol: "cliente", activo: true },
  ]) {
    await t.test(`rejects target ${JSON.stringify(target)}`, async () => {
      const fixture = setup({ target });
      await assert.rejects(promoteSuperadmin({
        email: "admin@example.com",
        UsuarioModel: fixture.UsuarioModel,
        confirmPromotion: async () => "PROMOVER",
      }), /admin existente y activo/);
      assert.equal(fixture.saveCount, 0);
    });
  }

  const target = { rol: "admin", activo: true, tokenVersion: 0, async save() {} };
  const fixture = setup({ target });
  await assert.rejects(promoteSuperadmin({
    email: "admin@example.com",
    UsuarioModel: fixture.UsuarioModel,
    confirmPromotion: async () => "NO",
  }), /Promoción cancelada/);
  assert.equal(target.rol, "admin");
  assert.equal(target.tokenVersion, 0);
  assert.equal(fixture.saveCount, 0);
});
