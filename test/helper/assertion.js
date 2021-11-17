function componentExistance (component) {
  expect(component.exists()).toBe(true)
}

function componentsTextContainText (components, expected) {
  for (let i = 0; i < components.length; i += 1) {
    expect(components.at(i).text()).toContain(expected)
  }
}

function componentsTextContainArray (components, expected, f) {
  expect(components.length).toBe(expected.length)

  for (let i = 0; i < expected.length; i += 1) {
    expect(components.at(i).text()).toContain(f(expected[i]))
  }
}

function componentsTextNotContainText (components, notExpected) {
  for (let i = 0; i < components.length; i += 1) {
    expect(components.at(i).text()).not.toContain(notExpected)
  }
}

function componentsTextNotContainArray (components, notExpected, f = e => e) {
  for (let i = 0; i < components.length; i += 1) {
    for (let j = 0; j < notExpected.length; j += 1) {
      // Mi aspetto che nessun tweet della seconda pagina sia mostrato
      expect(components.at(i).text()).not.toContain(f(notExpected[j]))
    }
  }
}

function componentsPropValue (components, expected, prop, assertion) {
  for (let i = 0; i < components.length; i += 1) {
    const p = prop(components.at(i).props())
    assertion(expect(p), expected)
  }
}

function componentsPropArray (components, expected, prop, assertion, f = e => e) {
  expect(components.length).toBe(expected.length)

  for (let i = 0; i < components.length; i += 1) {
    const p = prop(components.at(i).props())
    assertion(expect(p), f(expected[i]))
  }
}

function componentsPropValueNot (components, expected, prop, assertion) {
  for (let i = 0; i < components.length; i += 1) {
    const p = prop(components.at(i).props())
    assertion(expect(p).not, expected)
  }
}

function componentsPropArrayNot (components, expected, prop, assertion, f = e => e) {
  for (let i = 0; i < components.length; i += 1) {
    const p = prop(components.at(i).props())

    for (let j = 0; j < expected.length; j += 1) {
      assertion(expect(p).not, f(expected[j]))
    }
  }
}

function componentsPropToBeValue (components, expected, prop) {
  componentsPropValue(components, expected, prop, (act, exp) => act.toBe(exp))
}

function componentsPropToBeArray (components, expected, prop, f = e => e) {
  componentsPropArray(components, expected, prop, (act, exp) => act.toBe(exp), f)
}

function componentsPropToNotBeValue (components, expected, prop) {
  componentsPropValueNot(components, expected, prop, (act, exp) => act.toBe(exp))
}

function componentsPropToNotBeArray (components, expected, prop, f = e => e) {
  componentsPropArrayNot(components, expected, prop, (act, exp) => act.toBe(exp), f)
}

function componentsPropToContainValue (components, expected, prop) {
  componentsPropValue(components, expected, prop, (act, exp) => act.toContain(exp))
}

function componentsPropToContainArray (components, expected, prop, f = e => e) {
  componentsPropArray(components, expected, prop, (act, exp) => act.toContain(exp), f)
}

function componentsPropToNotContainValue (components, expected, prop) {
  componentsPropValueNot(components, expected, prop, (act, exp) => act.toContain(exp))
}

function componentsPropToNotContainArray (components, expected, prop, f = e => e) {
  componentsPropArrayNot(components, expected, prop, (act, exp) => act.toContain(exp), f)
}

export default {
  componentExistance,
  componentsTextContainText,
  componentsTextContainArray,
  componentsTextNotContainText,
  componentsTextNotContainArray,
  componentsPropToBeValue,
  componentsPropToBeArray,
  componentsPropValue,
  componentsPropArray,
  componentsPropToContainValue,
  componentsPropToContainArray,
  componentsPropValueNot,
  componentsPropArrayNot,
  componentsPropToNotBeArray,
  componentsPropToNotBeValue,
  componentsPropToNotContainValue,
  componentsPropToNotContainArray
}
