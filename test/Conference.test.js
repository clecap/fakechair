const expectThrow = require('./helpers/expectThrow');
const expectEvent = require('./helpers/expectEvent');

const Conference = artifacts.require('Conference');

require('chai')
  .use(require('chai-as-promised'))
  .should();

const ROLE_ADMIN = 'admin';
const ROLE_PCMEMBER = 'pcmember';
const ROLE_AUTHOR = 'author';


contract('Conference', function (accounts) {
  let mock;

  const [
    admin,
    author1,
    author2,
    author3,
    author4,
    futurePCmember,
    ...pcmembers
  ] = accounts;

  const _id = 0;
  const _title = 'MyTestConference';
  const _ipfsHash = "0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba";

  before(async () => {
    mock = await Conference.new(_id, _title, _ipfsHash,{ from: admin });
    await mock.addPCmembers(pcmembers, { from: admin });
    await mock.addAuthors([author3,author4], { from: admin });
  });

  context('in normal conditions', () => {
    it('allows an admin to add a PCmember', async () => {
      await mock.addPCmembers([futurePCmember], { from: admin })
        .should.be.fulfilled;
    });   
    it('allows an admin to add an Author', async () => {
      await mock.addAuthors([author1], { from: admin })
        .should.be.fulfilled;
    });
    it('allows an PCmember to add an Author', async () => {
      await mock.addAuthors([author2], { from: pcmembers[1] })
        .should.be.fulfilled;
    });
    it('allows an admin to remove a PCmember\'s role', async () => {
      await mock.removePCmember(pcmembers[1], { from: admin })
        .should.be.fulfilled;
    });
    it('allows an admin to remove an Author\'s role', async () => {
      await mock.removeAuthor(author3, { from: admin })
        .should.be.fulfilled;
    });
    it('allows an pcmember to remove an Author\'s role', async () => {
      await mock.removeAuthor(author4, { from: pcmembers[0] })
        .should.be.fulfilled;
    });

    it('announces a RoleAdded event on addRole', async () => {
      await expectEvent.inTransaction(
        mock.adminAddRole(futurePCmember, ROLE_PCMEMBER, { from: admin }),
        'RoleAdded'
      );
    });

    it('announces a RoleRemoved event on removeRole', async () => {
      await expectEvent.inTransaction(
        mock.adminRemoveRole(futurePCmember, ROLE_PCMEMBER, { from: admin }),
        'RoleRemoved'
      );
    });
  });

  context('in adversarial conditions', () => {
    it('does not allow a pcmember to remove another pcmember', async () => {
      await expectThrow.expectThrow(
        mock.removePCmember(pcmembers[2], { from: pcmembers[0] })
      );
    });
    it('does not allow author to remove an author', async () => {
      await expectThrow.expectThrow(
        mock.removeAuthor(author3, { from: author4 })
      );
    });
    it('does not allow author to remove an pcmember', async () => {
      await expectThrow.expectThrow(
        mock.removePCmember(pcmembers[2], { from: author3 })
      );
    });
  });
});