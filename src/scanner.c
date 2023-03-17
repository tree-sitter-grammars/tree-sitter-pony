#include <tree_sitter/parser.h>
#include <wctype.h>
#include <stdio.h>

enum TokenType {
  BLOCK_COMMENT,
  STRING,
  CHARACTER,
};


bool tree_sitter_pony_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {

  // skip whitespace, but mark if we found newlines
  while (iswspace(lexer->lookahead))
  {
    lexer->advance(lexer, true);
  }

 

  // handle block comments
  if (valid_symbols[BLOCK_COMMENT] && lexer->lookahead == '/')
  {
    lexer->advance(lexer, false);
    if (lexer->lookahead != '*')
    {
      return false;
    }
    lexer->advance(lexer, false);

    // we are inside a block comment
    bool after_asterisk = false;
    unsigned nesting_depth = 1;
    for (;;)
    {
      switch (lexer->lookahead)
      {
        case '\0':
          return false;
        case '*':
          lexer->advance(lexer, false);
          after_asterisk = true;
          break;
        case '/':
          if (after_asterisk)
          {
            lexer->advance(lexer, false);
            after_asterisk = false;
            nesting_depth--;
            if (nesting_depth == 0)
            {
              lexer->result_symbol = BLOCK_COMMENT;
              return true;
            }
          }
          else
          {
            lexer->advance(lexer, false);
            after_asterisk = false;
            if (lexer->lookahead == '*')
            {
              nesting_depth++;
              lexer->advance(lexer, false);
            }
          }
        default:
          lexer->advance(lexer, false);
          after_asterisk = false;
          break;
      }
    }
  }

  if (valid_symbols[CHARACTER] && lexer->lookahead == '\'')
  {
    // CHARACTER LITERAL 'A'
    lexer->advance(lexer, false);
    bool inside_escape = false;
    for (;;)
    {
      switch(lexer->lookahead)
      {
        case '\0':
          return false;
        case '\\':
          // escape
          lexer->advance(lexer, false);
          // toggle, as we are getting out of a quote when we have double
          // backslashes
          inside_escape = !inside_escape;
          break;
        case '\'':
          lexer->advance(lexer, false);
          // terminating single-quote
          if(!inside_escape)
          {
            lexer->result_symbol = CHARACTER;
            return true;
          }
          else
          {
            // leaving the escaped quote
            inside_escape = false;
          }
          break;
        default:
          lexer->advance(lexer, false);
          inside_escape = false;
          break;
      }
    }
  }
  else if (valid_symbols[STRING])
  {
    // handle strings, docstrings and quoting
    uint32_t quote_count = 0;
    while (lexer->lookahead == '"' && quote_count < 3) {
      quote_count++;
      lexer->advance(lexer, false);
    }

    switch (quote_count)
    {
      case 2:
        // empty string
        lexer->result_symbol = STRING;
        return true;
      case 1:
        // single quote string - handle quoting
        {
          bool escaped_quote = false;
          for (;;)
          {
            switch(lexer->lookahead)
            {
              case '\0':
                return false;
              case '\\':
                lexer->advance(lexer, false);
                // toggle, as we are getting out of a quote when we have double
                // backslashes
                escaped_quote = !escaped_quote;
                break;
              case '"':
                lexer->advance(lexer, false);
                if (!escaped_quote)
                {
                  // terminating quote
                  lexer->result_symbol = STRING;
                  return true;
                }
                else
                {
                  // we now leave the escaped quote
                  escaped_quote = false;
                }
                break;
              default:
                lexer->advance(lexer, false);
                escaped_quote = false;
                break;
            }
          }

          break;
        }
      case 3:
        // within docstring - no quoting
        {
          quote_count = 0;
          while (quote_count < 3) {
            if (lexer->lookahead == '"') {
              quote_count++;
              lexer->advance(lexer, false);
            } else {
              quote_count = 0;
              if (lexer->lookahead == 0) return false;
              lexer->advance(lexer, false);
            }
          }
          // consume additional quotes
          while (lexer->lookahead == '"')
            lexer->advance(lexer, false);

          lexer->result_symbol = STRING;
          return true;
        }
      default:
        // no quote
        return false;
    }
  }
  return false;
}


void *tree_sitter_pony_external_scanner_create() {
  return NULL;
}

void tree_sitter_pony_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_pony_external_scanner_serialize(
  void *payload,
  char *buffer
) {
  return 0;
}

void tree_sitter_pony_external_scanner_deserialize(
  void *payload,
  const char *buffer,
  unsigned length
) {}
