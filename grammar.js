/**
 * @file Pony grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  LAMBDA: -2,
  PARENTHESES: -1,
  ASSIGNMENT: 1,
  BINARY: 2,
  CAST: 3,
  UNARY: 4,
  CALL: 5,
  MEMBER: 6,
};

module.exports = grammar({
  name: 'pony',

  conflicts: $ => [
    [$.expression, $.generic_type],
  ],

  extras: $ => [
    $.comment,
    /\s/,
  ],

  supertypes: $ => [
    $.expression,
    $.statement,
    $.type,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => seq(
      optional($.string),
      repeat($.statement),
    ),

    statement: $ => choice(
      $.use_statement,
      $.type_alias,
      $.actor_definition,
      $.class_definition,
      $.primitive_definition,
      $.interface_definition,
      $.trait_definition,
      $.struct_definition,
    ),

    use_statement: $ => seq(
      'use',
      optional(seq($.identifier, '=')),
      choice(
        $.string,
        $.ffi_method,
      ),
      optional($.platform_specifier),
    ),
    ffi_method: $ => seq(
      '@',
      choice($.identifier, $.string),
      field('returns', seq('[', $.type, ']')),
      $.parameters,
      optional('?'),
    ),
    platform_specifier: $ => $.if_block,

    type_alias: $ => seq(
      'type',
      $.identifier,
      optional(alias($.generic_parameters, $.type_parameters)),
      'is',
      $.type,
      optional($.string),
    ),

    actor_definition: $ => seq(
      'actor',
      optional($.annotation),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      repeat($.field),
      repeat(choice(
        $.constructor,
        $.method,
        $.behavior,
      )),
    ),

    class_definition: $ => seq(
      'class',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      repeat($.field),
      repeat(choice(
        $.constructor,
        $.method,
        $.behavior,
      )),
    ),

    primitive_definition: $ => seq(
      'primitive',
      optional($.annotation),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      repeat(choice(
        $.constructor,
        $.method,
      )),
    ),

    interface_definition: $ => seq(
      'interface',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      repeat(choice(
        $.constructor,
        $.method,
        $.behavior,
      )),
    ),

    trait_definition: $ => seq(
      'trait',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      repeat(choice(
        $.constructor,
        $.method,
        $.behavior,
      )),
    ),

    struct_definition: $ => seq(
      'struct',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional($.string),
      repeat($.field),
      repeat(choice(
        $.constructor,
        $.method,
      )),
    ),

    field: $ => seq(
      choice('embed', 'let', 'var'),
      $.identifier,
      ':',
      $.type,
      optional(seq('=', $.expression)),
      optional($.string),
    ),

    constructor: $ => seq(
      'new',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      $.parameters,
      optional('?'),
      optional(choice(
        seq('=>', $.block),
        $.string,
      )),
    ),

    method: $ => seq(
      'fun',
      optional($.annotation),
      optional($.capability),
      optional('@'),
      $.identifier,
      optional($.generic_parameters),
      $.parameters,
      optional(seq(':', field('returns', $.type))),
      optional('?'),
      optional(choice(
        seq('=>', $.block),
        $.string,
      )),
    ),

    behavior: $ => seq(
      'be',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      $.parameters,
      optional(choice(
        seq('=>', $.block),
        $.string,
      )),
    ),

    annotation: $ => seq('\\', commaSep1($.identifier), '\\'),

    capability: _ => choice('iso', 'trn', 'ref', 'val', 'box', 'tag'),

    parameters: $ => seq('(', commaSep($.parameter), ')'),

    parameter: $ => choice(
      seq($.identifier, ':', $.type, optional(seq('=', $.expression))),
      '...',
    ),

    type: $ => choice(
      $.base_type,
      $.aliased_type,
      $.ephemeral_type,
      $.generic_type,
      $.tuple_type,
      $.isolated_type,
      $.transition_type,
      $.reference_type,
      $.value_type,
      $.box_type,
      $.tag_type,
      $.union_type,
      $.intersection_type,
      $.viewpoint_type,
      $.lambda_type,
      $.member_type,
      $.this,
      $.none,
    ),

    base_type: $ => prec.right(seq($.identifier, optional($.type_capability))),

    type_capability: _ => choice(
      '#read',
      '#send',
      '#share',
      '#alias',
      '#any',
    ),

    aliased_type: $ => seq($.type, '!'),

    ephemeral_type: $ => seq($.type, '^'),

    generic_type: $ => seq(
      choice($.identifier, $.ffi_identifier),
      '[',
      commaSep1(seq($.type, optional(seq('=', $.type)))),
      ']',
      optional($.type_capability),
    ),

    tuple_type: $ => seq('(', commaSep1($.type), ')'),

    isolated_type: $ => seq($.type, 'iso'),

    transition_type: $ => seq($.type, 'trn'),

    reference_type: $ => seq($.type, 'ref'),

    value_type: $ => seq($.type, 'val'),

    box_type: $ => seq($.type, 'box'),

    tag_type: $ => seq($.type, 'tag'),

    union_type: $ => prec.right(seq(
      choice(
        seq('(', $.type, repeat1(prec.right(seq('|', $.type))), ')'),
        seq($.type, repeat1(prec.right(seq('|', $.type)))),
      ),
    )),

    intersection_type: $ => prec.right(seq(
      choice(
        seq('(', $.type, repeat1(prec.right(seq('&', $.type))), ')'),
        seq($.type, repeat1(prec.right(seq('&', $.type)))),
      ),
    )),

    viewpoint_type: $ => prec.right(seq($.type, '->', $.type)),

    lambda_type: $ => seq(
      optional('@'),
      '{',
      optional($.capability),
      optional($.identifier),
      optional(alias($.generic_parameters, $.type_parameters)),
      '(',
      commaSep($.type),
      ')',
      optional(seq(':', $.type)),
      optional('?'),
      '}',
    ),

    member_type: $ => prec.right(seq($.identifier, '.', $.type)),

    block: $ => prec.left(seq($.expression, repeat(seq(optional(';'), $.expression)))),

    expression: $ => choice(
      $.unary_expression,
      $.binary_expression,
      $.assignment_expression,
      $.variable_declaration,
      $.cast_expression,
      $.call_expression,
      $.lambda_expression,
      $.partial_application,
      $.chain_expression,
      $.if_statement,
      $.iftype_statement,
      $.for_statement,
      $.while_statement,
      $.try_statement,
      $.with_statement,
      $.repeat_statement,
      $.recover_expression,
      $.match_expression,
      $.return_statement,
      $.continue_statement,
      $.break_statement,
      $.consume_expression,
      $.member_expression,
      $.parenthesized_expression,
      $.tuple_expression,
      $.generic_type,
      $.literal,
      $.identifier,
      $.ffi_identifier,
      $.this,
      $.none,
    ),

    unary_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('-', 'not', '-~', 'addressof', 'digestof')),
      field('argument', $.expression),
    )),

    // Binary expressions have no operator precedence in Pony
    binary_expression: $ => {
      const operators = [
        '+', '-', '*', '/', '%', '%%', '<<', '>>',
        'and', 'or', 'xor', 'is', 'isnt',
        '==', '!=', '>', '>=', '<=', '<',
        '+~', '-~', '*~', '/~', '%~', '%%~', '<<~', '>>~',
        '==~', '!=~', '>~', '>=~', '<=~', '<~',
        '+?', '-?', '*?', '/?', '%?', '%%?',
      ];

      return choice(...operators.map((operator) => {
        return prec.left(PREC.BINARY, seq(
          field('left', $.expression),
          field('operator', operator),
          field('right', $.expression),
        ));
      }));
    },

    tuple_expression: $ => prec(PREC.PARENTHESES, seq(
      '(',
      $.expression,
      ',',
      commaSep1($.expression),
      ')',
    )),

    assignment_expression: $ => prec.left(PREC.ASSIGNMENT, seq(
      $.expression,
      '=',
      $.block,
    )),

    variable_declaration: $ => prec.right(seq(
      choice('let', 'var'),
      $.identifier,
      optional(seq(':', $.type)),
    )),

    cast_expression: $ => prec(PREC.CAST, seq(
      $.expression,
      'as',
      $.type,
    )),

    call_expression: $ => prec.left(PREC.CALL, seq(
      field('callee', $.expression),
      '(',
      commaSep($.expression),
      optional($.named_arguments),
      ')',
      optional('?'),
    )),
    named_arguments: $ => seq(
      'where',
      commaSep(seq($.identifier, '=', $.expression)),
    ),

    lambda_expression: $ => seq(
      optional('@'),
      '{',
      optional($.capability),
      '(',
      commaSep($.lambda_parameter),
      ')',
      optional($.lambda_captures),
      optional(seq(':', $.type)),
      optional('?'),
      '=>',
      $.block,
      '}',
      optional($.capability),
    ),
    lambda_parameter: $ => seq(
      $.identifier,
      optional(seq(':', $.type)),
      optional(seq('=', $.expression)),
    ),
    lambda_captures: $ => seq(
      '(',
      commaSep(seq(
        $.identifier,
        optional(seq(':', $.type)),
        optional(seq('=', $.expression)),
      )),
      ')',
    ),

    partial_application: $ => prec.right(PREC.MEMBER, seq(
      $.expression,
      '~',
      $.expression,
    )),

    chain_expression: $ => prec.right(PREC.MEMBER, seq(
      $.expression,
      '.>',
      $.expression,
    )),

    member_expression: $ => prec.right(PREC.MEMBER, seq(
      $.expression,
      '.',
      $.expression,
    )),

    parenthesized_expression: $ => prec(PREC.PARENTHESES, seq(
      '(', $.expression, ')',
    )),

    if_statement: $ => seq(
      $.if_block,
      $.then_block,
      repeat($.elseif_block),
      optional($.else_block),
      'end',
    ),

    if_block: $ => seq(
      choice('if', 'ifdef'),
      optional($.annotation),
      $.block,
    ),

    then_block: $ => seq(
      'then',
      optional($.annotation),
      $.block,
    ),

    elseif_block: $ => seq(
      'elseif',
      optional($.annotation),
      $.block,
      $.then_block,
    ),

    iftype_statement: $ => seq(
      'iftype',
      $.type,
      '<:',
      $.type,
      $.then_block,
      repeat($.elseiftype_block),
      optional($.else_block),
      'end',
    ),

    elseiftype_block: $ => seq(
      'elseif',
      optional($.annotation),
      seq($.type, '<:', $.type),
      $.then_block,
    ),

    else_block: $ => seq(
      'else',
      optional($.annotation),
      $.block,
    ),

    for_statement: $ => seq(
      'for',
      choice($.identifier, $.tuple_expression),
      'in',
      field('collection', $.expression),
      $.do_block,
    ),

    while_statement: $ => seq(
      'while',
      optional($.annotation),
      repeat1($.expression),
      $.do_block,
    ),

    try_statement: $ => seq(
      'try',
      optional($.annotation),
      $.block,
      optional($.else_block),
      optional($.then_block),
      'end',
    ),

    with_statement: $ => seq(
      'with',
      // TODO: add with exprs `with a = initializer(), b = initializer() do ... end`
      $.expression,
      $.do_block,
    ),

    repeat_statement: $ => seq(
      'repeat',
      optional($.annotation),
      $.block,
      'until',
      optional($.annotation),
      $.expression,
      optional($.else_block),
      'end',
    ),

    do_block: $ => seq(
      'do',
      $.block,
      optional($.else_block),
      'end',
    ),

    recover_expression: $ => seq(
      'recover',
      optional($.annotation),
      optional($.capability),
      $.block,
      'end',
    ),

    match_expression: $ => seq(
      'match',
      optional($.annotation),
      $.block,
      repeat1($.case_statement),
      optional($.else_block),
      'end',
    ),

    case_statement: $ => seq(
      '|',
      optional($.annotation),
      choice(
        seq(
          seq($.expression, repeat(seq('|', $.expression))),
          optional($.if_block),
        ),
        $.if_block,
      ),
      '=>',
      $.block,
    ),

    return_statement: $ => prec.left(seq('return', optional($.block))),

    continue_statement: $ => prec.left(seq('continue', optional($.block))),

    break_statement: $ => prec.left(seq('break', optional($.block))),

    consume_expression: $ => seq('consume', optional($.capability), $.identifier),

    generic_parameters: $ => seq(
      '[',
      commaSep1(seq(
        $.type,
        optional(seq(':', $.type)),
        optional(seq('=', $.type)),
      )),
      ']',
    ),

    literal: $ => choice(
      $.array_literal,
      $.object_literal,
      $.number,
      $.float,
      $.string,
      $.character,
      $.boolean,
    ),

    array_literal: $ => seq(
      '[',
      optional(seq('as', $.type, ':')),
      optional($.block),
      ']',
    ),

    object_literal: $ => seq(
      'object',
      optional($.capability),
      optional(seq('is', $.type)),
      repeat($.field),
      repeat(choice($.method, $.behavior)),
      'end',
    ),

    number: _ => {
      const hexadecimal = /0[xX][0-9a-fA-F][0-9a-fA-F_]*/;
      const binary = /0[bB][01][01_]*/;
      const decimal = /[0-9][0-9_]*/;

      return token(choice(
        hexadecimal,
        binary,
        decimal,
      ));
    },

    float: _ => {
      // stupidly this results in ~200 less states
      // vs a prettier alternative
      const decimal = /[0-9][0-9_]*/;
      const dot_decimal = /[0-9][0-9_]*\.[0-9][0-9_]*/;
      const exponent = /[eE][+-]?[0-9]+/;

      return token(choice(
        seq(decimal, exponent),
        seq(dot_decimal, optional(exponent)),
      ));
    },

    string: $ => choice($._string_literal, $._multiline_string_literal),

    _string_literal: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $._escape_sequence,
      )),
      '"',
    ),
    _multiline_string_literal: $ => prec.right(seq(
      '"""',
      repeat(choice(
        alias($._multiline_string_content, $.string_content),
        $._escape_sequence,
      )),
      '"""',
    )),

    character: $ => seq(
      '\'',
      repeat1(
        choice(
          $.character_content,
          $._escape_sequence,
        ),
      ),
      '\'',
    ),
    character_content: _ => token.immediate(prec(2, /[^'\\]+/)),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token_ constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    string_content: _ => token.immediate(prec(1, /[^"\\]+/)),
    _multiline_string_content: _ =>
      prec.right(choice(
        /[^"]+/,
        seq(/"[^"]*/, repeat(/[^"]+/)),
      )),


    _escape_sequence: $ => choice(
      prec(2, token.immediate(seq('\\', /[^abfnrtvxu'\"\\\?]/))),
      prec(1, $.escape_sequence),
    ),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[^xu0-7]/,
        /[0-7]{1,3}/,
        /x[0-9a-fA-F]{2}/,
        /u[0-9a-fA-F]{4}/,
        /u{[0-9a-fA-F]+}/,
        /U[0-9a-fA-F]{8}/,
      ))),

    boolean: _ => choice('true', 'false'),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_']*/,
    ffi_identifier: $ => seq('@', choice($.identifier, $.string)),

    this: _ => 'this',

    none: _ => 'None',

    comment: _ => token(choice(
      seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});

module.exports.PREC = PREC;

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
