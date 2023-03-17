[
  (line_comment)
  (block_comment)
] @comment

[
  "("
  ")"
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket

[
  ";"
  "."
  ","
] @punctuation.delimiter

[
  "if"
  "ifdef"
  "then"
  "else"
  "elseif"
  "end"
  "try"
  "while"
  "for"
  "use"
  "as"
  "var"
  "let"
  "embed"
  "fun"
  "be"
  "new"
  "actor"
  "class"
  "struct"
  "primitive"
  "interface"
  "trait"
  "type"
  "iso"
  "trn"
  "ref"
  "val"
  "box"
  "tag"
  "#read"
  "#send"
  "#share"
  "#alias"
  "#any"
] @keyword

;; Operators
[
 "?"
 "=>"

 "~"
 ".>"

 "+"
 "-"
 "*"
 "/"
 "%"
 "%%"
 "+~"
 "-~"
 "/~"
 "*~"
 "%~"
 "%%~"

 ">>"
 "<<"
 ">>~"
 "<<~"

 "=="
 "!="
 ">"
 "<"
 ">="
 "<="

 "and"
 "or"
 "xor"
 "is"
 "isnt"
 "not"
] @operator

(boolean) @contant.builtin
[
  (number)
  (float)
] @number

;; strings/docstrings
(source_file . (string) @string.special)
(actor_definition (identifier) @type (string)? @string.special)
(class_definition (identifier) @type (string)? @string.special)
(primitive_definition (identifier) @type (string)? @string.special)
(interface_definition (identifier) @type (string)? @string.special)
(trait_definition (identifier) @type (string)? @string.special)
(struct_definition (identifier) @type (string)? @string.special)
(type_alias (identifier) @type (string)? @string.special)

(constructor (identifier) @constructor (string)? @string.special)
(method (identifier) @function.method (string)? @string.special)
(behavior (identifier) @function.method (string)? @string.special)
(constructor (block . (literal (string)) @string.special))
(method (block . (literal (string)) @string.special))
(behavior (block . (literal (string)) @string.special))
(string) @string

(field name: (identifier) @property)
(parameter name: (identifier) @variable.parameter)
(lambda_parameter name: (identifier) @variable.parameter)

; types
(base_type name: (identifier)+ @type)
(generic_parameter (identifier) @type)
(lambda_type (identifier)? @function.method)

; variables
(variable_declaration (identifier) @variable)
(identifier) @variable
