# Changelog

## 1.0.0 (2023-06-23)


### Features

* add __loc ([048b8ab](https://github.com/amaanq/tree-sitter-pony/commit/048b8aba3cfca4dce92939eb7d51b7bd64c3a6b0))
* add arguments node for call arguments ([5be42c8](https://github.com/amaanq/tree-sitter-pony/commit/5be42c8e27d19279446d864c043d8cf199f8d177))
* add extra nodes for members and named_argument ([9251b9e](https://github.com/amaanq/tree-sitter-pony/commit/9251b9e5a29e330643c29459b3d72cc4769ec334))
* add release please and fuzz action ([b5d48ce](https://github.com/amaanq/tree-sitter-pony/commit/b5d48ce253bf9a5c4722c9b51e41bf49135fa822))
* add tests, add `block` rule and apply where necessary, and fix some rules ([#1](https://github.com/amaanq/tree-sitter-pony/issues/1)) ([9da263a](https://github.com/amaanq/tree-sitter-pony/commit/9da263a6102eb81b5c059f7adcfa9ce13da09d47))
* complete the queries and grammar ([9b2b6a3](https://github.com/amaanq/tree-sitter-pony/commit/9b2b6a32d1116d71b7182fb7a3bbbcfcd7215cf0))
* **grammar:** Add provides type to struct definition ([f8756b1](https://github.com/amaanq/tree-sitter-pony/commit/f8756b156d78b4c5703a8ade96285b184d390203))
* Initial working parser ([1cc3a83](https://github.com/amaanq/tree-sitter-pony/commit/1cc3a83c6c9109c724647b90b25e6385515f9826))
* properly handle some edge cases ([846ccc3](https://github.com/amaanq/tree-sitter-pony/commit/846ccc3f7da17f3919de9f82830d677ac81c91a9))
* properly parse multiline string literals with more than 3 immediate starting/ending quotes ([3a83ea3](https://github.com/amaanq/tree-sitter-pony/commit/3a83ea3c0af84efb0f0ad91ec1cb73a108e3e359))
* **queries:** add folds, indents, injections, locals, and tags, update highlights ([f3122c6](https://github.com/amaanq/tree-sitter-pony/commit/f3122c6b111ca966ca53681f6f4721d694d97ead))
* v0.0.2 ([af8a2d4](https://github.com/amaanq/tree-sitter-pony/commit/af8a2d40ed813d818380e7798f16732f34d95bf6))
* v0.0.3 ([5fd795a](https://github.com/amaanq/tree-sitter-pony/commit/5fd795ae7597b568b0a356c5d243cc92162bc00c))


### Bug Fixes

* remove `None` as a special rule ([1d89837](https://github.com/amaanq/tree-sitter-pony/commit/1d89837a0765a5c84d54c413605cb24e0d937fac))
* strings with quoted text immediately followed by triple quotes were not being parsed correctly ([c72e244](https://github.com/amaanq/tree-sitter-pony/commit/c72e244d8d8d91d42e54db157fa2f0de1dbecac3))
* use a stateful scanner to keep track of quote count to avoid infinite loop bug ([49733fd](https://github.com/amaanq/tree-sitter-pony/commit/49733fdb8d8ede20b45dc7e3398fb9fb76cb167d))
