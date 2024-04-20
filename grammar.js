/**
 * @file Pony grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @author Matthias Wahl <matthiaswahl@m7w3.de>
 * @see {@link https://www.ponylang.io|official website}
 * @see {@link https://tutorial.ponylang.io|official tutorial}
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
  TYPEARGS: 7,
  ARRAY_LITERAL: 8,
};

module.exports = grammar({
  name: 'pony',

  externals: $ => [
    $._type_args_start,
    $.block_comment,
    $._multiline_string_content,
  ],

  extras: $ => [
    $.line_comment,
    $.block_comment,
    /\s/,
  ],

  supertypes: $ => [
    $.expression,
    $.literal,
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

    members: $ => choice(
      repeat1($.field),
      repeat1(
        choice(
          $.constructor,
          $.method,
          $.behavior,
        ),
      ),
      seq(
        repeat1($.field),
        repeat1(
          choice(
            $.constructor,
            $.method,
            $.behavior,
          ),
        ),
      ),
    ),

    actor_definition: $ => seq(
      'actor',
      optional($.annotation),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      optional($.members),
    ),

    class_definition: $ => seq(
      'class',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      optional($.members),
    ),

    primitive_definition: $ => seq(
      'primitive',
      optional($.annotation),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      optional($.members),
    ),

    interface_definition: $ => seq(
      'interface',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      optional($.members),
    ),

    trait_definition: $ => seq(
      'trait',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      optional($.members),
    ),

    struct_definition: $ => seq(
      'struct',
      optional($.annotation),
      optional($.capability),
      $.identifier,
      optional($.generic_parameters),
      optional(seq('is', $.type)),
      optional($.string),
      optional($.members),
    ),

    field: $ => seq(
      choice('embed', 'let', 'var'),
      field('name', $.identifier),
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
      seq(
        field('name', $.identifier),
        ':',
        $.type,
        optional(seq('=', $.expression))),
      '...',
    ),

    type: $ => choice(
      $.base_type,
      $.aliased_type,
      $.ephemeral_type,
      $.read_type,
      $.send_type,
      $.share_type,
      $.alias_type,
      $.any_type,
      $.iso_type,
      $.trn_type,
      $.ref_type,
      $.val_type,
      $.box_type,
      $.tag_type,
      $.tuple_type,
      $.union_type,
      $.intersection_type,
      $.viewpoint_type,
      $.lambda_type,
      $.this,
    ),

    base_type: $ => prec.right(seq(
      field('name', sep1('.', $.identifier)),
      optional($.type_args),
    )),

    type_args: $ => seq(
      alias($._type_args_start, '['),
      commaSep1($.type),
      ']',
    ),

    read_type: $ => seq(choice($.base_type, $.lambda_type), '#read'),
    send_type: $ => seq(choice($.base_type, $.lambda_type), '#send'),
    share_type: $ => seq(choice($.base_type, $.lambda_type), '#share'),
    alias_type: $ => seq(choice($.base_type, $.lambda_type), '#alias'),
    any_type: $ => seq(choice($.base_type, $.lambda_type), '#any'),
    iso_type: $ => seq(choice($.base_type, $.lambda_type), 'iso'),
    trn_type: $ => seq(choice($.base_type, $.lambda_type), 'trn'),
    ref_type: $ => seq(choice($.base_type, $.lambda_type), 'ref'),
    val_type: $ => seq(choice($.base_type, $.lambda_type), 'val'),
    box_type: $ => seq(choice($.base_type, $.lambda_type), 'box'),
    tag_type: $ => seq(choice($.base_type, $.lambda_type), 'tag'),
    aliased_type: $ => seq($.type, '!'),
    ephemeral_type: $ => seq($.type, '^'),

    tuple_type: $ => seq('(', commaSep1($.type), ')'),

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

    lambda_parameters: $ => seq(
      '(',
      commaSep($.type),
      ')',
    ),
    lambda_type: $ => seq(
      optional('@'),
      '{',
      optional($.capability),
      optional($.identifier),
      optional(alias($.generic_parameters, $.type_parameters)),
      $.lambda_parameters,
      optional(seq(':', field('returns', $.type))),
      optional('?'),
      '}',
    ),

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
      $.recover_statement,
      $.match_statement,
      $.return_statement,
      $.continue_statement,
      $.break_statement,
      $.consume_statement,
      $.member_expression,
      $.parenthesized_expression,
      $.tuple_expression,
      $.generic_expression,
      $.literal,
      $.identifier,
      $.ffi_identifier,
      $.this,
      $.error,
      $.compile_intrinsic,
      $.compile_error,
      $.location,
    ),

    error: _ => 'error',
    compile_intrinsic: _ => 'compile_intrinsic',
    compile_error: $ => prec.left(seq('compile_error', optional($.string))),
    location: _ => '__loc',

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

    generic_expression: $ => seq(
      choice($.identifier, $.ffi_identifier),
      $.type_args,
    ),

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

    call_expression: $ => prec(PREC.CALL, seq(
      field('callee', $.expression),
      $.arguments,
      optional('?'),
    )),
    arguments: $ => seq(
      token.immediate('('),
      field('positional', commaSep($.expression)),
      optional($.named_arguments),
      ')',
    ),

    chain_expression: $ => prec.right(PREC.CALL, seq(
      $.expression,
      '.>',
      $.expression,
    )),

    named_arguments: $ => seq(
      'where',
      commaSep($.named_argument),
    ),
    named_argument: $ => seq($.identifier, '=', $.expression),

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
    lambda_parameter: $ => prec(PREC.LAMBDA, seq(
      field('name', $.identifier),
      optional(seq(':', $.type)),
      optional(seq('=', $.expression)),
    )),
    lambda_captures: $ => seq(
      '(',
      commaSep(seq(
        $.identifier,
        optional(seq(':', $.type)),
        optional(seq('=', $.expression)),
      )),
      ')',
    ),

    partial_application: $ => prec.left(PREC.MEMBER, seq(
      $.expression,
      '~',
      $.expression,
    )),

    member_expression: $ => prec.left(PREC.MEMBER, seq(
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
      optional($.annotation),
      commaSep1($.with_elem),
      $.do_block,
    ),
    with_elem: $ => seq(
      $.identifier,
      '=',
      $.block,
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

    recover_statement: $ => seq(
      'recover',
      optional($.annotation),
      optional($.capability),
      $.block,
      'end',
    ),

    match_statement: $ => seq(
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

    consume_statement: $ => seq('consume', optional($.capability), $.identifier),

    generic_parameter: $ => seq(
      $.identifier,
      optional(seq(':', $.type)),
      optional(seq('=', field('default', $.type))),
    ),

    generic_parameters: $ => seq('[', commaSep1($.generic_parameter), ']'),

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
      optional($.members),
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
      // Stupidly this results in ~200 less states
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
      repeat(alias($._multiline_string_content, $.string_content)),
      '"""',
    )),

    character: $ => seq(
      '\'',
      repeat1(choice(
        $.character_content,
        $._escape_sequence,
      )),
      '\'',
    ),
    character_content: _ => token.immediate(prec(2, /[^'\\]+/)),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token_ constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    string_content: _ => token.immediate(prec(1, /[^"\\]+/)),

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
        /u\{[0-9a-fA-F]+\}/,
        /U[0-9a-fA-F]{8}/,
      ))),

    boolean: _ => choice('true', 'false'),

    this: _ => 'this',

    identifier: _ => token(prec(-1, /[a-zA-Z_][a-zA-Z0-9_']*/)),
    ffi_identifier: $ => seq('@', choice($.identifier, $.string)),

    line_comment: _ => token(seq('//', /(\\(.|\r?\n)|[^\\\n])*/)),
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
  return sep1(',', rule);
}

/**
 * Creates a rule to match on or more occurrences of `rule` separated by `sep`
 *
  @param {string} sep
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function sep1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}
