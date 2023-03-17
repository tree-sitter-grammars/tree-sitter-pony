#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType {
  TYPE_ARGS_START,
  BLOCK_COMMENT,
};

void *tree_sitter_pony_external_scanner_create() { return NULL; }

void tree_sitter_pony_external_scanner_destroy(void *payload) {}

void tree_sitter_pony_external_scanner_reset(void *payload) {}

unsigned tree_sitter_pony_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  return 0;
}

void tree_sitter_pony_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {}

bool tree_sitter_pony_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {

  // We ACCEPT [ if there's whitespace but NO newline, otherwise ignore
  if (valid_symbols[TYPE_ARGS_START]) {
    while (iswspace(lexer->lookahead) && lexer->lookahead != '\0' &&
           lexer->lookahead != '\n') {
      lexer->advance(lexer, false);
    }

    if (lexer->lookahead == '[') {
      lexer->advance(lexer, false);
      lexer->result_symbol = TYPE_ARGS_START;
      return true;
    }
  }

  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

  if (lexer->lookahead == '/') {
    lexer->advance(lexer, false);
    if (lexer->lookahead != '*')
      return false;
    lexer->advance(lexer, false);

    bool after_star = false;
    unsigned nesting_depth = 1;
    for (;;) {
      switch (lexer->lookahead) {
      case '\0':
        return false;
      case '*':
        lexer->advance(lexer, false);
        after_star = true;
        break;
      case '/':
        if (after_star) {
          lexer->advance(lexer, false);
          after_star = false;
          nesting_depth--;
          if (nesting_depth == 0) {
            lexer->result_symbol = BLOCK_COMMENT;
            return true;
          }
        } else {
          lexer->advance(lexer, false);
          after_star = false;
          if (lexer->lookahead == '*') {
            nesting_depth++;
            lexer->advance(lexer, false);
          }
        }
        break;
      default:
        lexer->advance(lexer, false);
        after_star = false;
        break;
      }
    }
  }

  return false;
}
