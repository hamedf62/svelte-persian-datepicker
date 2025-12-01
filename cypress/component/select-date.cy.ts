/// <reference types="Cypress" />

describe('select date - range', () => {
  before(() => {
    cy.changeProps('mode', 'range');
    cy.changeSlots();
  });

  it('with click on dates', () => {
    cy.get('.pdp-input').focus();
    cy.get('.pdp-day').not('.empty').not('.disabled').contains('10').click();
    cy.get('.pdp-day').not('.empty').not('.disabled').contains('15').click();
    cy.get('.pdp-input').should('have.value', '1399/06/10 - 1399/06/15');
  });

  it('with arrow keys', () => {
    cy.get('.pdp-input')
      .focus()
      .wait(1)
      .type('{downarrow}{downarrow}{leftarrow}{leftarrow}{enter}')
      .type('{downarrow}{rightarrow}{rightarrow}{enter}')
      .should('have.value', '1399/06/10 - 1399/06/15');
  });

  it('with type the date', () => {
    cy.get('.pdp-input')
      .focus()
      .type('1399/06/10{enter}')
      .clear()
      .type('1399/06/15{enter}')
      .should('have.value', '1399/06/10 - 1399/06/15');
  });
});

describe('select date - single', () => {
  before(() => {
    cy.changeProps('mode', 'single');
  });

  it('with click on dates', () => {
    cy.get('.pdp-input').focus();
    cy.get('.pdp-day').not('.empty').not('.disabled').contains('10').click();
    cy.get('.pdp-input').should('have.value', '1399/06/10');
  });

  it('with arrow keys', () => {
    cy.get('.pdp-input')
      .focus()
      .wait(1)
      .type('{downarrow}{downarrow}{leftarrow}{leftarrow}{enter}')
      .should('have.value', '1399/06/10');
  });

  it('with type the date', () => {
    cy.get('.pdp-input')
      .focus()
      .type('1399/06/10{enter}')
      .should('have.value', '1399/06/10');
  });
});

describe('select date with disable date - single', () => {
  before(() => {
    cy.changeProps('disable', '1399/06/05');
  });

  it('with click on dates', () => {
    cy.get('.pdp-input').focus();
    cy.contains('5').click();
    cy.get('.pdp-input').should('have.value', '');
    cy.contains('6').click();
    cy.get('.pdp-input').should('have.value', '1399/06/06');
  });

  it('with arrow keys', () => {
    cy.get('.pdp-input')
      .focus()
      .wait(1)
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{enter}')
      .should('have.value', '')
      .type('{leftarrow}{enter}')
      .should('have.value', '1399/06/06');
  });

  it('with type the date', () => {
    cy.get('.pdp-input')
      .focus()
      .type('1399/06/05{enter}')
      .should('have.value', '1399/06/05')
      .clear()
      .type('1399/06/06{enter}')
      .should('have.value', '1399/06/06')
      .focus();
    cy.get('.pdp-day.start-range').should('contain.text', '6');
  });
});

describe('select date with disable date - range', () => {
  before(() => {
    cy.changeProps({ disable: '1399/06/05', mode: 'range' });
  });

  it('with click on dates', () => {
    cy.get('.pdp-input').focus();
    cy.contains('5').click();
    cy.get('.pdp-input').should('have.value', '');
    cy.get('.pdp-day').contains(/^3$/).click();
    cy.get('.pdp-day.start-range').should('contain.text', '3');
    cy.get('.pdp-day').contains(/^6$/).click();
    cy.get('.pdp-day').contains(/^5$/).click();
    cy.get('.pdp-day').contains(/^4$/).click();
    cy.get('.pdp-input')
      .focus()
      .should('have.value', '1399/06/03 - 1399/06/04');
    cy.get('.pdp-day.end-range').should('contain.text', '4');
  });

  it('with arrow keys', () => {
    cy.get('.pdp-input')
      .focus()
      .wait(1)
      .type('{downarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{enter}')
      .should('have.value', '')
      .type('{rightarrow}{rightarrow}{enter}');
    cy.get('.pdp-day.start-range').should('contain.text', '3');
    cy.get('.pdp-input')
      .type('{leftarrow}{leftarrow}{leftarrow}{enter}')
      .type('{rightarrow}{enter}')
      .type('{rightarrow}{enter}')
      .focus();
    cy.get('.pdp-day.end-range').should('contain.text', '4');
  });

  it('with type the date', () => {
    cy.get('.pdp-input')
      .focus()
      .type('1399/06/05{enter}')
      .should('have.value', '1399/06/05')
      .clear()
      .type('1399/06/03{enter}')
      .should('have.value', '1399/06/03');
    cy.get('.pdp-day.start-range').should('contain.text', '3');
    cy.get('.pdp-input')
      .clear()
      .type('1399/06/06{enter}')
      .should('have.value', '1399/06/06')
      .clear()
      .type('1399/06/05{enter}')
      .should('have.value', '1399/06/05')
      .clear()
      .type('1399/06/04{enter}')
      .should('have.value', '1399/06/03 - 1399/06/04')
      .focus();
    cy.get('.pdp-day.end-range').should('contain.text', '4');
  });
});

describe('select date in en locale - range', () => {
  before(() => {
    cy.changeProps('locale', 'en');
  });

  it('with click on dates', () => {
    cy.get('.pdp-input').focus();
    cy.contains('10').click();
    cy.contains('15').click();
    cy.get('.pdp-input').should('have.value', '2020-09-10 - 2020-09-15');
  });

  it('with arrow keys', () => {
    cy.get('.pdp-input')
      .focus()
      .wait(1)
      .type('{downarrow}{downarrow}{leftarrow}{leftarrow}{enter}')
      .type('{downarrow}{rightarrow}{rightarrow}{enter}')
      .should('have.value', '2020-09-06 - 2020-09-15');
  });

  it('with type the date', () => {
    cy.get('.pdp-input')
      .focus()
      .type('2020-09-10{enter}')
      .clear()
      .type('2020-09-15{enter}')
      .should('have.value', '2020-09-10 - 2020-09-15');
  });
});

describe('select date in en locale - single', () => {
  before(() => {
    cy.changeProps('mode', 'single');
  });

  it('with click on dates', () => {
    cy.get('.pdp-input').focus();
    cy.contains('10').click();
    cy.get('.pdp-input').should('have.value', '2020-09-10');
  });

  it('with arrow keys', () => {
    cy.get('.pdp-input')
      .focus()
      .wait(1)
      .type('{downarrow}{downarrow}{rightarrow}{rightarrow}{enter}')
      .should('have.value', '2020-09-10');
  });

  it('with type the date', () => {
    cy.get('.pdp-input')
      .focus()
      .type('2020-09-10{enter}')
      .should('have.value', '2020-09-10');
  });
});
